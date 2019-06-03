import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

import * as strings from 'VisionTrainerWebPartStrings';
import VisionTrainer from './components/VisionTrainer';
import { IVisionTrainerProps } from './components/IVisionTrainerProps';

export interface IVisionTrainerWebPartProps {
  trainingKey: string;
  projectId: string;
  endPoint: string;
  lists: string | string[]; // Stores the list ID(s)
  wTitle: string;
}

export default class VisionTrainerWebPart extends BaseClientSideWebPart<IVisionTrainerWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IVisionTrainerProps > = React.createElement(
      VisionTrainer,
      {
        trainingKey: this.properties.trainingKey,
        projectId: this.properties.projectId,
        endPoint: this.properties.endPoint,
        listID: this.properties.lists,
        SPHttpClient: this.context.spHttpClient,
        sScope: this.context.serviceScope,
        wUrl: this.context.pageContext.web.absoluteUrl,
        wTitle: this.context.pageContext.web.serverRelativeUrl,
        httpC: this.context.httpClient
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('trainingKey', {
                  label: strings.TrainingKeyFieldLabel
                }),
                PropertyPaneTextField('projectId', {
                  label: strings.ProjectIdFieldLabel
                }),
                PropertyPaneTextField('endPoint', {
                  label: strings.EndPointFieldLabel
                })
              ]
            },
            {
              groupName: strings.SecondGroupName,
              groupFields: [
                PropertyFieldListPicker('lists', {
                  label: strings.SelectAListLabel,
                  selectedList: this.properties.lists,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'listPickerFieldId'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
