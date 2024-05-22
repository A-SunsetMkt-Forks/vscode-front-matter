export const TelemetryEvent = {
  activate: 'activate',
  initialization: 'initialization',
  registerFolder: 'registerFolder',
  unregisterFolder: 'unregisterFolder',
  promoteSettings: 'promoteSettings',

  // Commands
  openContentDashboard: 'openContentDashboard',
  openMediaDashboard: 'openMediaDashboard',
  openDataDashboard: 'openDataDashboard',
  openSnippetsDashboard: 'openSnippetsDashboard',
  openTaxonomyDashboard: 'openTaxonomyDashboard',
  closeDashboard: 'closeDashboard',

  // Other actions
  generateSlug: 'generateSlug',
  createContentFromTemplate: 'createContentFromTemplate',
  createContentFromContentType: 'createContentFromContentType',
  addMediaFolder: 'addMediaFolder',
  openPreview: 'openPreview',
  uploadMedia: 'uploadMedia',
  refreshMedia: 'refreshMedia',
  deleteMedia: 'deleteMedia',
  insertContentSnippet: 'insertContentSnippet',
  insertMediaToContent: 'insertMediaToContent',
  insertFileToContent: 'insertFileToContent',
  updateMediaMetadata: 'updateMediaMetadata',
  openPanelWebview: 'openPanelWebview',

  // Chatbot
  openChatbot: 'openChatbot',

  // Content types
  generateContentType: 'generateContentType',
  addMissingFields: 'addMissingFields',
  setContentType: 'setContentType',

  // Custom scripts
  runCustomScript: 'runCustomScript',
  runMediaScript: 'runMediaScript',

  // Webviews
  webviewWelcomeScreen: 'webviewWelcomeScreen',
  webviewMediaView: 'webviewMediaView',
  webviewDataView: 'webviewDataView',
  webviewContentsView: 'webviewContentsView',
  webviewSnippetsView: 'webviewSnippetsView',
  webviewTaxonomyDashboard: 'webviewTaxonomyDashboard',
  webviewSettings: 'webviewSettings',
  webviewUnknown: 'webviewUnknown',

  // Git
  gitSync: 'gitSync',
  gitFetch: 'gitFetch'
};
