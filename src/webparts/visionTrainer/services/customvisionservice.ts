
import { HttpClient, IHttpClientOptions, HttpClientResponse } from '@microsoft/sp-http';
export interface FileReaderEventTarget extends EventTarget {
    result:string
}

export interface FileReaderEvent extends Event {
    target: FileReaderEventTarget;
    getMessage():string;
}
export class CognitiveService {

    private trainingKey = "";
    private endPoint = "https://westeurope.api.cognitive.microsoft.com/customvision/v3.0/training/";
    private pRID = "";
    private context;

    constructor(trainingKey: string, endPoint: string, pRID: string, context: any) {
        this.trainingKey = trainingKey;
        this.endPoint = endPoint;
        this.pRID = pRID;
        this.context = context;
    }

    private async getTags(tag: string): Promise<object> {
        //Get existing tags and check if current exists
        const keyPostUrl: string = this.endPoint + 'projects/' + this.pRID + '/tags';
        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');
        requestHeaders.append('Cache-Control', 'no-cache');
        requestHeaders.append('Training-key', this.trainingKey);
        //console.log('Get Tag Url ' + keyPostUrl);
        const httpClientOptions: IHttpClientOptions = {
            headers: requestHeaders
        };
        
        return this.context.get(
        keyPostUrl,
        HttpClient.configurations.v1,
        httpClientOptions)
        .then((response: Response): Promise<HttpClientResponse> => {
            return response.json();
        }).then(data => {
            let findTag;
            if(typeof data.find === "function") {
                findTag = data.find((tg) => {
                    return tg.name === tag;
                });
                if (findTag === undefined) {
                    //If tag is not found then create new one and return value
                    return this.createTag(tag).then(newTag => {
                        return newTag;
                    });
                }
                else {
                   return findTag; 
                }
            }
        }); 
    }

    public async createTag(tag: string): Promise<object> {
        //Create tags
        const keyPostUrl: string = this.endPoint + 'projects/' + this.pRID + '/tags?name=' + tag;
        const requestHeaders: Headers = new Headers();
        requestHeaders.append('Content-type', 'application/json');
        requestHeaders.append('Cache-Control', 'no-cache');
        requestHeaders.append('Training-key', this.trainingKey);
        const httpClientOptions: IHttpClientOptions = {
            headers: requestHeaders
        };
        
        return this.context.post(
        keyPostUrl,
        HttpClient.configurations.v1,
        httpClientOptions)
        .then((response: Response): Promise<HttpClientResponse> => {
            console.log("REST API response received.");
            return response.json();
        }).then(data => {
            if (data != null) {
                return data;
            }
        });
    }

    private async uploadImages(tag: string, imageUrls: Array<any>): Promise<String> {
        
        const imageBatch: any = {images:[], tagIds: [tag]};
        //Added a delay due to API limits
        const delay = interval => new Promise(resolve => setTimeout(resolve, interval));
        await delay(2000);

        return Promise.all(        
            imageUrls.map(iUrl => {
                let iType = iUrl.url.substring(iUrl.url.lastIndexOf('.')+1);
                let fName = iUrl.url.substring(iUrl.url.lastIndexOf('/')+1);
                const toDataURL = url => fetch(url)
                .then(response => response.blob())
                .then(blob => new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result)
                    reader.onerror = reject
                    reader.readAsDataURL(blob)
                }));
                return toDataURL(iUrl.url).then(dataUrl => {
                    let fContents = dataUrl.toString().substring(dataUrl.toString().indexOf(',')+1);
                    imageBatch.images.push({name: fName, contents: fContents, tagIds: [tag], regions: [
                        {
                            tagId: tag,
                            left: 0.0,
                            top: 0.0,
                            width: 0.0,
                            height: 0.0
                        }
                    ]});
                });  
            })
        ).then(onComp => {
            
            //Add images
            const keyPostUrl: string = this.endPoint + 'projects/' + this.pRID + '/images/files';
            const requestHeaders: Headers = new Headers();
            requestHeaders.append('Content-type', 'application/json');
            requestHeaders.append('Cache-Control', 'no-cache');
            requestHeaders.append('Training-key', this.trainingKey);
    
            const httpClientOptions: IHttpClientOptions = {
                body: JSON.stringify(imageBatch),
                headers: requestHeaders
            };
            
            return this.context.post(
            keyPostUrl,
            HttpClient.configurations.v1,
            httpClientOptions)
            .then((response: Response): Promise<HttpClientResponse> => {
                return response.json();
            }).then(data => {
                console.log(data);
                console.log("Is batch successful: " + data.isBatchSuccessful); 
            });  
        });
    }



    public async trainVision(): Promise<any> {
        console.log('Training called:');
        const keyPostUrl: string = this.endPoint + 'projects/' + this.pRID + '/train';
            const requestHeaders: Headers = new Headers();
            requestHeaders.append('Content-type', 'application/json');
            requestHeaders.append('Cache-Control', 'no-cache');
            requestHeaders.append('Training-key', this.trainingKey);
    
            const httpClientOptions: IHttpClientOptions = {
                headers: requestHeaders
            };
            
            return this.context.post(
            keyPostUrl,
            HttpClient.configurations.v1,
            httpClientOptions)
            .then((response: Response): Promise<HttpClientResponse> => {
                return response.json();
            }).then(data => {
                console.log('Training called:');
                console.log(data);
                return data.message
            });  
    }

    public async uploadStart(tag: string, imageUrls: Array<any>): Promise<String> {
        
        this.getTags(tag).then(gTR => {
            return gTR;
        }).then((tg: any) => {
            let nT = tg.id;
            
            this.uploadImages(nT, imageUrls).then(resp => {
                //console.log(resp);
            });
        });
        return 'success';
    }

}



