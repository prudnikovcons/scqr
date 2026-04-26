#!/usr/bin/env node
import { Command } from 'commander';
import { logger } from './lib/logger.ts';

const program = new Command();

program
  .name('scqr')
  .description('SCQR editorial engine — signal pipeline + article production state')
  .version('0.1.0');

program
  .command('doctor')
  .description('Health-check: DB, env, paths, source reachability (subset)')
  .action(async () => {
    const { runDoctor } = await import('./commands/doctor.ts');
    await runDoctor();
  });

program
  .command('collect')
  .argument('[slot]', 'morning|evening|ad-hoc', 'ad-hoc')
  .option('--dry-run', 'Do not write to DB, just report')
  .option('--source <id>', 'Limit to a single source id')
  .description('Fetch active sources, normalize, dedupe, cluster, write signals')
  .action(async (slot, opts) => {
    const { runCollect } = await import('./commands/collect.ts');
    await runCollect({ slot, ...opts });
  });

program
  .command('pack')
  .argument('[slot]', 'morning|evening|ad-hoc', 'morning')
  .option('--limit <n>', 'Max signals in the pack', '25')
  .description('Assemble a signal pack in .scqr/packs/YYYY-MM-DD-slot.md')
  .action(async (slot, opts) => {
    const { runPack } = await import('./commands/pack.ts');
    await runPack({ slot, limit: Number(opts.limit) });
  });

const review = program.command('review').description('Review and decisions');
review
  .command('save <packId> <actionsJsonFile>')
  .description('Save parsed review_actions JSON produced by review-interpreter')
  .action(async (packId, actionsFile) => {
    const { saveReviewActions } = await import('./commands/review.ts');
    await saveReviewActions({ packId: Number(packId), actionsFile });
  });

const job = program.command('job').description('Article job lifecycle');
job
  .command('new <signalId> <actionJsonFile>')
  .description('Create a new article_job from a review_action')
  .action(async (signalId, actionFile) => {
    const { createJob } = await import('./commands/job.ts');
    await createJob({ signalId: Number(signalId), actionFile });
  });
job
  .command('context <jobId>')
  .description('Print job context for writer (input.json + style hints)')
  .action(async (jobId) => {
    const { printJobContext } = await import('./commands/job.ts');
    await printJobContext({ jobId });
  });
job
  .command('status <jobId> <newStatus>')
  .description('Update job status')
  .action(async (jobId, status) => {
    const { updateJobStatus } = await import('./commands/job.ts');
    await updateJobStatus({ jobId, status });
  });

const article = program.command('article').description('Article artifacts');
article
  .command('save <jobId> <frontmatterFile> <bodyFile>')
  .description('Save final article.md to site/src/content/posts/<slug>.md')
  .action(async (jobId, fmFile, bodyFile) => {
    const { saveArticle } = await import('./commands/article.ts');
    await saveArticle({ jobId, frontmatterFile: fmFile, bodyFile });
  });

const brief = program.command('brief').description('Visual briefs for covers and infographics');
brief
  .command('save <articleSlug> <briefFile>')
  .description('Record a visual-brief.md into .scqr/visual-queue/')
  .action(async (slug, file) => {
    const { saveBrief } = await import('./commands/brief.ts');
    await saveBrief({ slug, file });
  });

const publish = program.command('publish').description('Publish flow');
publish
  .command('prepare <slug>')
  .description('Validate + create article/<slug> branch + commit (no push)')
  .action(async (slug) => {
    const { preparePublish } = await import('./commands/publish.ts');
    await preparePublish({ slug });
  });

const sources = program.command('sources').description('Sources registry');
sources.command('list').action(async () => {
  const { listSources } = await import('./commands/sources.ts');
  await listSources();
});
sources
  .command('add <name> <url> <type>')
  .option('--rss <url>', 'RSS URL if different from main URL')
  .option('--lang <lang>', 'ru|en|zh|other', 'en')
  .option('--category <cat>', 'category slug', 'misc')
  .option('--score <n>', 'authority score 1-10', '5')
  .action(async (name, url, type, opts) => {
    const { addSource } = await import('./commands/sources.ts');
    await addSource({ name, url, type, ...opts });
  });
sources
  .command('deactivate <id>')
  .action(async (id) => {
    const { deactivateSource } = await import('./commands/sources.ts');
    await deactivateSource({ id: Number(id) });
  });

const db = program.command('db').description('Database utilities');
db
  .command('backup')
  .description('Copy .scqr/data.db to .scqr/backups/data-YYYYMMDD-HHmm.db')
  .action(async () => {
    const { runDbBackup } = await import('./commands/db.ts');
    await runDbBackup();
  });

const signals = program.command('signals').description('Signal management');
signals
  .command('archive')
  .description('Archive signals older than 90 days with status new or in_pack')
  .action(async () => {
    const { runSignalsArchive } = await import('./commands/signals.ts');
    await runSignalsArchive();
  });

program
  .command('retro <weekISO>')
  .description('Export decision_log + signals dynamics for retro-reviewer')
  .action(async (week) => {
    const { runRetro } = await import('./commands/retro.ts');
    await runRetro({ week });
  });

program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (err: any) {
  if (err?.code === 'commander.helpDisplayed' || err?.code === 'commander.version') {
    process.exit(0);
  }
  logger.error({ err: err?.message ?? err }, 'CLI command failed');
  process.exit(1);
}
