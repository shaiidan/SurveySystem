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

// sub colection in survey collection
export class SurveyQuestion {
    queDocId!:string; // doc 
    URLs!: UrlType [];
    descriptionTop!:string;
    descriptionBottom!:string;
    group!:number;
    isRequire :boolean = true;
    type!:number;
    chooserAnswers!: { id:number, order:number , result:string }[] | null;
    sliderAnswer!: {titleStart:string, titleEnd:string,minValue:number, maxValue:number , defaultValue:number | undefined} | null;
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