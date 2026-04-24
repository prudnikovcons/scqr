import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * 1. sources — реестр источников сигналов
 */
export const sources = sqliteTable(
  'sources',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    url: text('url').notNull(),
    rssUrl: text('rss_url'),
    type: text('type', {
      enum: ['rss', 'html', 'github', 'arxiv', 'regulator', 'blog'],
    }).notNull(),
    language: text('language', {
      enum: ['ru', 'en', 'zh', 'other'],
    })
      .notNull()
      .default('en'),
    category: text('category').notNull(),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    authorityScore: integer('authority_score').notNull().default(5),
    publishingFrequency: text('publishing_frequency', {
      enum: ['daily', 'weekly', 'monthly', 'irregular'],
    })
      .notNull()
      .default('weekly'),
    lastFetchedAt: integer('last_fetched_at', { mode: 'timestamp' }),
    lastError: text('last_error'),
    notes: text('notes'),
    addedAt: integer('added_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    activeIdx: index('sources_active_idx').on(table.active),
    typeIdx: index('sources_type_idx').on(table.type),
  }),
);

/**
 * 2. signals — отдельные материалы с источников
 */
export const signals = sqliteTable(
  'signals',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sourceId: integer('source_id')
      .notNull()
      .references(() => sources.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    fetchedAt: integer('fetched_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    contentHash: text('content_hash').notNull(),
    dedupeGroup: text('dedupe_group'),
    clusterId: integer('cluster_id').references(() => signalClusters.id, {
      onDelete: 'set null',
    }),
    status: text('status', {
      enum: [
        'new',
        'in_pack',
        'reviewed',
        'selected',
        'deferred',
        'archived',
        'kept_for_context',
        'series_candidate',
        'in_production',
        'published',
      ],
    })
      .notNull()
      .default('new'),
    deferUntil: integer('defer_until', { mode: 'timestamp' }),
    importance: integer('importance'),
  },
  (table) => ({
    statusIdx: index('signals_status_idx').on(table.status),
    sourceIdx: index('signals_source_idx').on(table.sourceId),
    publishedIdx: index('signals_published_idx').on(table.publishedAt),
    hashIdx: index('signals_hash_idx').on(table.contentHash),
  }),
);

/**
 * 3. signal_clusters — группы тематически близких сигналов
 */
export const signalClusters = sqliteTable('signal_clusters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  theme: text('theme').notNull(),
  storyCluster: text('story_cluster'),
  firstSeenAt: integer('first_seen_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  lastSeenAt: integer('last_seen_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  signalCount: integer('signal_count').notNull().default(0),
});

/**
 * 4. packs — md-пакеты сигналов для рецензии
 */
export const packs = sqliteTable(
  'packs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slot: text('slot', { enum: ['morning', 'evening', 'ad-hoc'] }).notNull(),
    date: text('date').notNull(),
    generatedAt: integer('generated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    pathToMd: text('path_to_md').notNull(),
    signalCount: integer('signal_count').notNull().default(0),
    status: text('status', {
      enum: ['pending_review', 'reviewed', 'archived'],
    })
      .notNull()
      .default('pending_review'),
  },
  (table) => ({
    dateIdx: index('packs_date_idx').on(table.date),
    statusIdx: index('packs_status_idx').on(table.status),
  }),
);

/**
 * 5. pack_items — связь pack ↔ signals с порядком показа
 */
export const packItems = sqliteTable(
  'pack_items',
  {
    packId: integer('pack_id')
      .notNull()
      .references(() => packs.id, { onDelete: 'cascade' }),
    signalId: integer('signal_id')
      .notNull()
      .references(() => signals.id, { onDelete: 'cascade' }),
    ordering: integer('ordering').notNull(),
    summaryLine: text('summary_line'),
    importanceNote: text('importance_note'),
    displayId: text('display_id').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.packId, table.signalId] }),
  }),
);

/**
 * 6. reviews — сессии рецензии владельца
 */
export const reviews = sqliteTable(
  'reviews',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    packId: integer('pack_id')
      .notNull()
      .references(() => packs.id, { onDelete: 'cascade' }),
    receivedAt: integer('received_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    rawTextPath: text('raw_text_path').notNull(),
    parsedActionsJson: text('parsed_actions_json'),
    interpreterModel: text('interpreter_model'),
    interpreterLogPath: text('interpreter_log_path'),
  },
  (table) => ({
    packIdx: index('reviews_pack_idx').on(table.packId),
  }),
);

/**
 * 7. review_actions — разобранные действия по каждому сигналу
 */
export const reviewActions = sqliteTable(
  'review_actions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    reviewId: integer('review_id')
      .notNull()
      .references(() => reviews.id, { onDelete: 'cascade' }),
    signalId: integer('signal_id')
      .notNull()
      .references(() => signals.id, { onDelete: 'cascade' }),
    action: text('action', {
      enum: ['write', 'defer', 'archive', 'keep_context', 'combine', 'series_candidate'],
    }).notNull(),
    thesis: text('thesis'),
    tone: text('tone'),
    mustInclude: text('must_include'),
    mustAvoid: text('must_avoid'),
    combineWith: text('combine_with'),
    reason: text('reason'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    reviewIdx: index('review_actions_review_idx').on(table.reviewId),
    signalIdx: index('review_actions_signal_idx').on(table.signalId),
    actionIdx: index('review_actions_action_idx').on(table.action),
  }),
);

/**
 * 8. article_jobs — очередь производства статей
 */
export const articleJobs = sqliteTable(
  'article_jobs',
  {
    id: text('id').primaryKey(),
    signalId: integer('signal_id').references(() => signals.id, { onDelete: 'set null' }),
    reviewActionId: integer('review_action_id').references(() => reviewActions.id, {
      onDelete: 'set null',
    }),
    status: text('status', {
      enum: [
        'pending',
        'drafting',
        'editing',
        'factchecking',
        'briefing',
        'ready',
        'published',
        'cancelled',
      ],
    })
      .notNull()
      .default('pending'),
    slug: text('slug'),
    jobDir: text('job_dir').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    publishedArticleSlug: text('published_article_slug'),
    errorMessage: text('error_message'),
  },
  (table) => ({
    statusIdx: index('article_jobs_status_idx').on(table.status),
    signalIdx: index('article_jobs_signal_idx').on(table.signalId),
  }),
);

/**
 * 9. decision_log — след всех редакционных решений
 */
export const decisionLog = sqliteTable(
  'decision_log',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    entityType: text('entity_type', {
      enum: ['signal', 'pack', 'article', 'source'],
    }).notNull(),
    entityId: text('entity_id').notNull(),
    decision: text('decision').notNull(),
    reason: text('reason'),
    decidedBy: text('decided_by', {
      enum: ['owner', 'review-interpreter', 'writer', 'editor', 'factchecker', 'visual-briefer', 'retro', 'cli', 'auto'],
    }).notNull(),
    decidedAt: integer('decided_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    metadataJson: text('metadata_json'),
  },
  (table) => ({
    entityIdx: index('decision_log_entity_idx').on(table.entityType, table.entityId),
    decidedAtIdx: index('decision_log_decided_at_idx').on(table.decidedAt),
  }),
);

/**
 * 10. memory — наблюдения ретро и ручные заметки
 */
export const memory = sqliteTable(
  'memory',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    week: text('week').notNull(),
    topic: text('topic').notNull(),
    observation: text('observation').notNull(),
    tagsCsv: text('tags_csv'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    source: text('source', { enum: ['retro', 'manual'] })
      .notNull()
      .default('retro'),
  },
  (table) => ({
    weekIdx: index('memory_week_idx').on(table.week),
    topicIdx: index('memory_topic_idx').on(table.topic),
  }),
);

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Signal = typeof signals.$inferSelect;
export type NewSignal = typeof signals.$inferInsert;
export type SignalCluster = typeof signalClusters.$inferSelect;
export type Pack = typeof packs.$inferSelect;
export type NewPack = typeof packs.$inferInsert;
export type PackItem = typeof packItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type ReviewAction = typeof reviewActions.$inferSelect;
export type NewReviewAction = typeof reviewActions.$inferInsert;
export type ArticleJob = typeof articleJobs.$inferSelect;
export type NewArticleJob = typeof articleJobs.$inferInsert;
export type DecisionLog = typeof decisionLog.$inferSelect;
export type MemoryEntry = typeof memory.$inferSelect;
