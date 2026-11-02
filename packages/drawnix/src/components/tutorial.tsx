import React from 'react';
import { useI18n } from '../i18n';
import './tutorial.scss';

export const Tutorial: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="drawnix-tutorial">
      <div className="tutorial-overlay">
        <div className="tutorial-content">
          <h1 className="brand-title">{t('tutorial.title')}</h1>
          <p className="brand-description">{t('tutorial.description')}</p>
          <p className="brand-tooltip">{t('tutorial.dataDescription')}</p>

          <div className="feature-pointer hint-menu">
            <svg className="pointer-arrow-svg" width="58" height="54" viewBox="0 0 58 54">
              <defs>
                <marker
                  id="arrow-menu"
                  markerWidth="10"
                  markerHeight="10"
                  refX="0"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L6,3 z" fill="#888" />
                </marker>
              </defs>
              <path
                d="M 50,48 Q 24,42 12,9"
                fill="none"
                stroke="#aaa"
                strokeWidth="1.5"
                markerEnd="url(#arrow-menu)"
              />
            </svg>
            <div className="pointer-content">
              <p>{t('tutorial.appToolbar')}</p>
            </div>
          </div>

          <div className="feature-pointer hint-toolbar">
            <div className="pointer-content">
              <p>{t('tutorial.creationToolbar')}</p>
            </div>
            <svg className="pointer-arrow-svg" width="54" height="42" viewBox="0 0 54 42">
              <defs>
                <marker
                  id="arrow-toolbar"
                  markerWidth="10"
                  markerHeight="10"
                  refX="0"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L6,3 z" fill="#888" />
                </marker>
              </defs>
              <path
                d="M 12,2 Q 20,22 27,36"
                fill="none"
                stroke="#aaa"
                strokeWidth="1.5"
                markerEnd="url(#arrow-toolbar)"
              />
            </svg>
          </div>

          <div className="feature-pointer hint-theme">
            <div className="pointer-content">
              <p>{t('tutorial.themeDescription')}</p>
            </div>
            <svg className="pointer-arrow-svg" width="60" height="42" viewBox="0 0 60 42">
              <defs>
                <marker
                  id="arrow-theme"
                  markerWidth="10"
                  markerHeight="10"
                  refX="0"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L6,3 z" fill="#888" />
                </marker>
              </defs>
              <path
                d="M 3,2 Q 15,26 44,36"
                fill="none"
                stroke="#aaa"
                strokeWidth="1.5"
                markerEnd="url(#arrow-theme)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
