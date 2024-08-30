export class SurveyDetails {
    docId!:string;
    title!:string;
    isActive!:boolean;
}

export type UrlType = {
    id: number;
    format: string;
    data: string;
} 

export type ChooserAnswerType = { id:number, order:number , result:string };
export type SliderAnswerType = {titleStart:string, titleEnd:string,minValue:number, maxValue:number , defaultValue:number | undefined};

// sub colection in survey collection
export class SurveyQuestion {
    queDocId!:string; // doc 
    URLs!: UrlType [];
    descriptionTop!:string;
    descriptionBottom!:string;
    group:number = 0;
    isRequire :boolean = true;
    type!:number;
    chooserAnswers!: ChooserAnswerType[] | null;
    sliderAnswer!: SliderAnswerType | null;
    resultForChoocsGroup!:{result:string, group:number} | undefined | null; 
}

// sub colection in survey collection
export class SurveyResult {
    queDocId!:string; 
    userDocId?:string;
    resultKey!:number | null;
    resultValue!:string;
    timeToAnswer!:number;
}

// sub colection in survey collection
export class SurveyUser {
    timeToAnswer!:number;
    city!:string;
    age!:number
    gender!:string
    education!:string
}