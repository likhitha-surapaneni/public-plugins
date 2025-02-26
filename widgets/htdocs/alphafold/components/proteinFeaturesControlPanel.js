import { html, css, LitElement } from 'https://unpkg.com/lit@2.2.5/index.js?module';

import './controlPanel.js';

export class ProteinFeaturesControlPanel extends LitElement {

  static get styles() {
    return css`
      .section-summary {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        column-gap: 8px;
        align-items: center;
        font-weight: bold;
        padding: 8px 4px 8px 6px;
      }

      .features-count {
        min-width: 10px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: bold;
        border: 1px solid var(--main-dark);
        text-align: center;
        border-radius: 10px;
      }

      .show-feature, .panel-content-toggle {
        width: 16px;
        height: 16px;
        border: none;
        outline: none;
        cursor: pointer;
      }

      .show-feature_hidden {
        background: url(/i/16/eye_no.png);
      }

      .show-feature_visible {
        background: url(/i/16/eye.png);
      }

      .toggle-expanded {
        background: url(/i/16/minus-button.png) no-repeat right center;
      }

      .toggle-collapsed {
        background: url(/i/16/plus-button.png) no-repeat right center;      
      }

      .protein-features {
        width: 100%;
        border: 1px solid #ccc;
      }

      .protein-features th {
        background-color: #ccc;
        padding: 4px;
      }

      .protein-features tbody tr td:nth-child(2),
      .protein-features tbody tr td:nth-child(3) {
        text-align: center;
      }

      .feature-row td:first-child {
        border-left-width: 5px;
        border-left-style: solid;
        padding-left: 6px;
      }

      a {
        text-decoration:none;
        color: var(--link-color);
      }

      a:visited {
        color: var(--link-visited-color);
      }

      a:hover {
        color: var(--link-hover-color);
      }

      a:active {
        color: var(--link-hover-color);
      }

    `;
  }

  static get properties() {
    return {
      proteinFeatures: { attribute: false },
      selectedIndices: { attribute: false },
      expandedSections: { state: true }
    }
  }

  willUpdate(updatedProperties) {
    if (updatedProperties.has('proteinFeatures') && !this.expandedSections) {
      this.expandedSections = Object.keys(this.proteinFeatures)
        .reduce((obj, key) => {
          obj[key] = false;
          return obj;
        }, {});
    }
  }

  areAllFeaturesVisible(type) {
    const selectedIndices = this.selectedIndices[type];
    const features = this.proteinFeatures[type];
    return selectedIndices.length === features.length;
  }

  isFeatureVisible(type, index) {
    const selectedIndices = this.selectedIndices[type];
    return selectedIndices.includes(index);
  }

  toggleAllFeatures(featureType) {
    const areFeaturesSelected = this.selectedIndices[featureType].length === this.proteinFeatures[featureType].length;
    if (areFeaturesSelected) {
      this.onSelectionChange({
        ...this.selectedIndices,
        [featureType]: []
      });
    } else {
      const featureIndices = this.proteinFeatures[featureType].map((_, index) => index);
      this.onSelectionChange({
        ...this.selectedIndices,
        [featureType]: featureIndices
      });
    }
  }

  toggleFeature(featureType, featureIndex) {
    if (this.selectedIndices[featureType].includes(featureIndex)) {
      const filteredIndices = {
        ...this.selectedIndices,
        [featureType]: this.selectedIndices[featureType].filter(index => index !== featureIndex)
      };
      this.onSelectionChange(filteredIndices);
    } else {
      const indices = {
        ...this.selectedIndices,
        [featureType]: [...this.selectedIndices[featureType], featureIndex]
      };
      this.onSelectionChange(indices);
    }
  }

  render() {
    return html`
      <control-panel title="Protein features">
        ${ this.renderSections() }
      </control-panel>
    `;
  }

  renderSections() {
    if (!this.proteinFeatures) {
      return null;
    }

    return proteinFeatureTypes
      .filter(type => type in this.proteinFeatures)
      .map(type => this.renderSection(type))
  }

  renderSection(featureType) {
    const features = this.proteinFeatures[featureType];

    return html`
      <div class="section">
        <div class="section-summary">
          <span class="section-title">
            ${featureType}
          </span>
          <span class="features-count">
            ${features.length}
          </span>
          <button
            class="show-feature ${this.areAllFeaturesVisible(featureType) ? 'show-feature_visible' : 'show-feature_hidden'}"
            @click=${() => this.toggleAllFeatures(featureType)}
          ></button>
          <button
            class="panel-content-toggle ${this.expandedSections[featureType] ? 'toggle-expanded' : 'toggle-collapsed'}"
            @click=${() => {
              this.expandedSections = {
                ...this.expandedSections,
                [featureType]: !this.expandedSections[featureType]
              }
            }}
          ></button>
        </div>
        ${ this.expandedSections[featureType] ? this.renderProteinFeatures(featureType) : null }
      </div>
    `;
  }

  renderProteinFeatures(featureType) {
    const features = this.proteinFeatures[featureType];
    const selectedIndices = this.selectedIndices[featureType];

    return html`
      <div class="features-wrapper">
        <table class="protein-features">
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${features.map((feature, index) => {
              return this.renderFeatureRow({
                feature,
                index,
                type: featureType,
                isVisible: selectedIndices.includes(index)
              })
            })}
          </tbody>
        </table>
      </div>
    `;
  }

  renderFeatureRow({ feature, index, type, isVisible }) {
    const link = type !== 'Gene3D' ? `${featureTypeToUrlPatternMap.get(type)}${feature.id}` : null; // Gene3D service is down anyway

    return html`
      <tr class="feature-row">
        <td style="border-color: ${feature.color}">
          ${ link ? html`
              <a href=${link} target="_blank">
                ${feature.id}
              </a>
            ` : feature.id
          }
        </td>
        <td>${feature.start}-${feature.end}</td>
        <td>
          <button
            class="show-feature ${isVisible ? 'show-feature_visible' : 'show-feature_hidden'}"
            @click=${() => this.toggleFeature(type, index)}
          ></button>
        </td>
      </tr>
    `;
  }

}

customElements.define('protein-features-control-panel', ProteinFeaturesControlPanel);


const featureTypeToUrlPatternMap = new Map([
  [ 'Gene3D', 'http://gene3d.biochem.ucl.ac.uk/Gene3D/search?mode=protein&sterm=' ],
  [ 'PANTHER', 'http://www.pantherdb.org/panther/family.do?clsAccession=' ],
  [ 'Pfam', 'https://pfam.xfam.org/family/' ],
  [ 'Smart', 'http://smart.embl-heidelberg.de/smart/do_annotation.pl?DOMAIN=' ],
  [ 'PRINTS', 'https://www.ebi.ac.uk/interpro/signature/' ],
]);

export const proteinFeatureTypes = [ ...featureTypeToUrlPatternMap.keys() ];
export const proteinFeatureTypesSet = new Set(proteinFeatureTypes);
