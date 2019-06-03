import {
  SPHttpClient,
} from '@microsoft/sp-http';
import { ServiceScope } from "@microsoft/sp-core-library";

export interface IVisionTrainerProps {
  trainingKey: string;
  projectId: string;
  endPoint: string;
  listID: string | string[];
  SPHttpClient: SPHttpClient;
  sScope: ServiceScope;
  wUrl: string;
  wTitle: string;
  httpC: any;
}
