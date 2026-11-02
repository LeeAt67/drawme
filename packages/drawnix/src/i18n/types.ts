import { ReactNode } from 'react';

// Define supported languages
export type Language = 'zh' | 'en' | 'ru' | 'ar' | 'vi';

// Define translation keys and their corresponding values
export interface Translations {
  // Toolbar items
  'toolbar.hand': string;
  'toolbar.selection': string;
  'toolbar.mind': string;
  'toolbar.text': string;
  'toolbar.arrow': string;
  'toolbar.shape': string;
  'toolbar.image': string;
  'toolbar.extraTools': string;
  'toolbar.collapse': string;
  'toolbar.expand': string;

  'toolbar.pen': string;
  'toolbar.eraser': string;

  'toolbar.arrow.straight': string;
  'toolbar.arrow.elbow': string;
  'toolbar.arrow.curve': string;

  'toolbar.shape.rectangle': string;
  'toolbar.shape.ellipse': string;
  'toolbar.shape.triangle': string;
  'toolbar.shape.terminal': string;
  'toolbar.shape.noteCurlyLeft': string;
  'toolbar.shape.noteCurlyRight': string;
  'toolbar.shape.diamond': string;
  'toolbar.shape.parallelogram': string;
  'toolbar.shape.roundRectangle': string;

  // Zoom controls
  'zoom.in': string;
  'zoom.out': string;
  'zoom.fit': string;
  'zoom.100': string;

  // Themes
  'theme.default': string;
  'theme.colorful': string;
  'theme.soft': string;
  'theme.retro': string;
  'theme.dark': string;
  'theme.starry': string;

  // Colors
  'color.none': string;
  'color.unknown': string;
  'color.default': string;
  'color.white': string;
  'color.gray': string;
  'color.deepBlue': string;
  'color.red': string;
  'color.green': string;
  'color.yellow': string;
  'color.purple': string;
  'color.orange': string;
  'color.pastelPink': string;
  'color.cyan': string;
  'color.brown': string;
  'color.forestGreen': string;
  'color.lightGray': string;

  // General
  'general.undo': string;
  'general.redo': string;
  'general.menu': string;
  'general.moreOptions': string;
  'general.duplicate': string;
  'general.delete': string;
  'layout.untitled': string;
  'layout.file': string;
  'layout.layers': string;
  'layout.assets': string;
  'layout.agent': string;
  'layout.settings': string;
  'layout.properties': string;
  'layout.collapsePanel': string;
  'layout.resizePanel': string;
  'layout.expandPanel': string;
  'layout.toggleUi': string;
  'layout.exitZen': string;
  'layout.zenHint': string;
  'layout.save.local': string;
  'layout.save.saving': string;
  'layout.save.saved': string;
  'layout.save.conflict': string;
  'layout.save.error': string;
  'layout.pages': string;
  'layout.page.default': string;
  'layout.pages.new': string;
  'layout.pages.comingSoon': string;
  'layout.layers.empty': string;
  'layout.layer.unnamed': string;
  'layout.assets.empty': string;
  'layout.properties.empty': string;
  'layout.properties.multi': string;
  'layout.properties.fill': string;
  'layout.properties.stroke': string;
  'layout.properties.text': string;
  'layout.properties.size': string;
  'layout.properties.link': string;
  'layout.share': string;
  'layout.share.copied': string;
  'layout.share.failed': string;
  'layout.account': string;
  'general.copyToClipboard': string;
  'general.copyToClipboard.svg': string;
  'general.copyToClipboard.png': string;
  'general.copyToClipboard.transparent': string;
  'toast.copyToClipboard.svg': string;
  'toast.copyToClipboard.png': string;
  'toast.copyToClipboard.mode.transparent': string;

  // Language
  'language.switcher': string;
  'language.chinese': string;
  'language.english': string;
  'language.russian': string;
  'language.arabic': string;
  'language.vietnamese': string;

  // Menu items
  'menu.open': string;
  'menu.saveFile': string;
  'menu.saveAsFile': string;
  'menu.exportImage': string;
  'menu.exportImage.svg': string;
  'menu.exportImage.png': string;
  'menu.exportImage.jpg': string;
  'menu.cleanBoard': string;
  'menu.github': string;

  // Dialog translations
  'dialog.mermaid.title': string;
  'dialog.mermaid.description': string;
  'dialog.mermaid.flowchart': string;
  'dialog.mermaid.sequence': string;
  'dialog.mermaid.class': string;
  'dialog.mermaid.otherTypes': string;
  'dialog.mermaid.syntax': string;
  'dialog.mermaid.placeholder': string;
  'dialog.mermaid.preview': string;
  'dialog.mermaid.insert': string;
  'dialog.markdown.description': string;
  'dialog.markdown.syntax': string;
  'dialog.markdown.placeholder': string;
  'dialog.markdown.preview': string;
  'dialog.markdown.insert': string;
  'dialog.error.loadMermaid': string;

  // Extra tools menu items
  'extraTools.mermaidToDrawnix': string;
  'extraTools.markdownToDrawnix': string;

  // Clean confirm dialog
  'cleanConfirm.title': string;
  'cleanConfirm.description': string;
  'cleanConfirm.cancel': string;
  'cleanConfirm.ok': string;

  // Link popup items
  'popupLink.delLink': string;

  // Tool popup items
  'popupToolbar.fillColor': string;
  'popupToolbar.fontSize': string;
  'popupToolbar.fontColor': string;
  'popupToolbar.link': string;
  'popupToolbar.stroke': string;
  'popupToolbar.opacity': string;

  // Text placeholders
  'textPlaceholders.link': string;
  'textPlaceholders.text': string;

  // Line tool
  'line.source': string;
  'line.target': string;
  'line.arrow': string;
  'line.none': string;

  // Stroke style
  'stroke.solid': string;
  'stroke.dashed': string;
  'stroke.dotted': string;

  //markdown example
  'markdown.example': string;

  // Draw elements text
  'draw.lineText': string;
  'draw.geometryText': string;

  // Mind map elements text
  'mind.centralText': string;
  'mind.abstractNodeText': string;

  // DrawMe Agent
  'agent.open': string;
  'agent.title': string;
  'agent.subtitle': string;
  'agent.close': string;
  'agent.settings': string;
  'agent.settings.title': string;
  'agent.settings.description': string;
  'agent.settings.model': string;
  'agent.settings.configured': string;
  'agent.settings.notConfigured': string;
  'agent.settings.loading': string;
  'agent.settings.refresh': string;
  'agent.settings.close': string;
  'agent.settings.serverManaged': string;
  'agent.settings.unconfiguredHint': string;
  'agent.auth.title': string;
  'agent.auth.description': string;
  'agent.auth.email': string;
  'agent.auth.password': string;
  'agent.auth.error': string;
  'agent.auth.signingIn': string;
  'agent.auth.signIn': string;
  'agent.auth.signedInAs': string;
  'agent.auth.signOut': string;
  'agent.auth.sessionExpired': string;
  'auth.account': string;
  'auth.signIn': string;
  'auth.signOut': string;
  'auth.signedOut': string;
  'auth.signedInAs': string;
  'auth.email': string;
  'auth.password': string;
  'auth.error': string;
  'auth.signingIn': string;
  'auth.or': string;
  'auth.dialog.title': string;
  'auth.dialog.description': string;
  'auth.dialog.close': string;
  'auth.dialog.note': string;
  'auth.dialog.signedInTitle': string;
  'auth.dialog.signedInDescription': string;
  'auth.agentRequiredTitle': string;
  'auth.agentRequiredDescription': string;
  'auth.signOutHint': string;
  'agent.empty.title': string;
  'agent.empty.description': string;
  'agent.placeholder': string;
  'agent.composer.hint': string;
  'agent.send': string;
  'agent.stop': string;
  'agent.thinking': string;
  'agent.tool.inserting': string;
  'agent.tool.generating': string;
  'agent.tool.inspected': string;
  'agent.tool.inserted': string;
  'agent.tool.failed': string;
  'agent.toast.inserted': string;
  'agent.error.request': string;
  'agent.error.aborted': string;
  'agent.annotate': string;
  'agent.annotate.hint': string;
  'agent.annotation.title': string;
  'agent.annotation.elements': string;
  'agent.annotation.empty': string;
  'agent.annotation.region': string;
  'agent.annotation.remove': string;
  'agent.annotation.defaultPrompt': string;
  'agent.message.you': string;
  'agent.message.agent': string;
  'agent.suggestion.flow': string;
  'agent.suggestion.architecture': string;
  'agent.suggestion.retro': string;

  'tutorial.title': string;
  'tutorial.description': string;
  'tutorial.dataDescription': string;
  'tutorial.appToolbar': string;
  'tutorial.creationToolbar': string;
  'tutorial.themeDescription': string;
}

// I18n context interface
export interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations) => string;
}

// Provider props
export interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
  initialLanguage?: Language;
  onLanguageChange?: (language: Language) => void;
}
