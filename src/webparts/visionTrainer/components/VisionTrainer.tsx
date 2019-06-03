import * as React from 'react';
import styles from './VisionTrainer.module.scss';
import * as strings from 'VisionTrainerWebPartStrings';
import { IVisionTrainerProps } from './IVisionTrainerProps';
import {
  ListService
} from '../services/listservice';
import { CognitiveService } from '../services/customvisionservice';
import { IListItem, IAllFolders } from '../interfaces';

export default class VisionTrainer extends React.Component<IVisionTrainerProps, IListItem> {
  constructor(props: IVisionTrainerProps) {
    super(props);
    this.startUpload = this.startUpload.bind(this);
    this.state = {
      Title: 'Please select a list by editing the web part properties.',
      ListSelected: false,
      AllSelected: false,
      AllImages: [],
      ReadyToTrain: false,
      TrainingText: 'Start Training'
    };
  }
  public componentDidMount(): void {
    this.callListService();
  }
  public componentDidUpdate(): void {
    this.callListService();
  }
  private cs: CognitiveService = new CognitiveService(this.props.trainingKey, this.props.endPoint, this.props.projectId, this.props.httpC);
  private callListService(): void {
    const gl: ListService = new ListService(this.props.sScope);
    if (this.props.listID != null) {
      //Get list tile
      gl.getListData(this.props.listID, this.props.wUrl).then((lval: IListItem) => {
        //Stop setState being repeated if new title equals old title
        if (this.state.Title != lval.Title) {
          let allSel = false;
          if (this.props.endPoint != null && this.props.projectId != null && this.props.trainingKey != null) {
            allSel = true;
          }
          this.setState({ 
            Title: lval.Title,
            ListSelected: true,
            AllSelected: allSel
          });
        }
      });

    }
  }
  private startUpload(): void {
    const gl: ListService = new ListService(this.props.sScope);
      //Get folder details for tags and REST calls
      gl.getListFolders(this.props.listID, this.props.wUrl).then((folders: IAllFolders) => {
        if (folders.Items instanceof Array) {
          folders.Items.map(fldr => {
            if (fldr.Name != "Forms") {
              //Get list items within folders
              let imgUrls = [];
              gl.getListItems(this.props.wUrl, this.props.wTitle, this.state.Title, fldr.Name).then((lIs) => {
                console.log('Results from ' + fldr.Name);
                console.log(lIs.Items );
                  lIs.Items.value.map((lI, ind) => {
                    imgUrls.push({url: window.location.protocol + '//' + window.location.hostname + lI.ServerRelativeUrl, key: ind});
                  });
                  this.setState({
                    AllImages: imgUrls
                  })
              }).then(fn => {
                  if(imgUrls.length > 0) {
                    this.callCognitiveService(fldr.Name, imgUrls);
                  }
              });
              
            }
          });
        }
      });
  }
  

  
  private callCognitiveService(tag, imgUrl): void {
    this.cs.uploadStart(tag, imgUrl).then(trFin => {
      trFin === 'success' ? this.setState({ReadyToTrain: true, TrainingText: 'Start Training'}) : this.setState({ReadyToTrain: false});
    });
  }

  private startTraining(this): void {
    this.cs.trainVision().then(resp => {
      this.setState({
        TrainingText: resp
      });
    });
  }

  public render(): React.ReactElement<IVisionTrainerProps> {
    return (
      <div className={ styles.visionTrainer }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <p className={ styles.title }>{strings.ListSelected + ' ' + this.state.Title}</p>
     
              {this.state.ListSelected === true? <button onClick={this.startUpload} title={'Upload images in ' + this.state.Title} className={ styles.button }>{strings.Upload}</button>: <div>{strings.CompletePropsTxt}</div>}
              
              {this.state.ReadyToTrain === true ? 
                <div>
                  <p>{strings.UploadSuccess}</p>
                  <button onClick={this.startTraining.bind(this)} title="Start Training" className={ styles.button }>{this.state.TrainingText}</button>
                </div>
                : ''}
              
            </div>
          </div>
        </div>
      </div>
    );
  }

}
