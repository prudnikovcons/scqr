import {
	clusterSpotlightBySlug,
	homepageEssays,
	homepageLead,
	homepageSignalClusters,
	homepageVisualGrid,
	premiumTrackPostIds,
	rubricLeadBySlug,
} from './curation.shared.js';

export interface SiteCuration {
	homepageLead: string;
	homepageVisualGrid: string[];
	homepageSignalClusters: string[];
	homepageEssays: string[];
	rubricLeadBySlug: Partial<Record<string, string>>;
	clusterSpotlightBySlug: Partial<Record<string, string>>;
	premiumTrackPostIds: string[];
}

export const SITE_CURATION: SiteCuration = {
	homepageLead,
	homepageVisualGrid,
	homepageSignalClusters,
	homepageEssays,
	rubricLeadBySlug,
	clusterSpotlightBySlug,
	premiumTrackPostIds,
};

export const PREMIUM_SLOT_IDS = new Set([
	SITE_CURATION.homepageLead,
	...SITE_CURATION.homepageVisualGrid,
	...SITE_CURATION.homepageEssays,
	...Object.values(SITE_CURATION.rubricLeadBySlug),
	...Object.values(SITE_CURATION.clusterSpotlightBySlug),
	...SITE_CURATION.premiumTrackPostIds,
].filter(Boolean));
