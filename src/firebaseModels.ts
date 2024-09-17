export class SurveyDetails {
    docId!:string;
    title!:string;
    isActive!:boolean;
    //countUserType:number; - in SurveyData 
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
    userType!:number;
    chooserAnswers!: ChooserAnswerType[] | null;
    sliderAnswer!: SliderAnswerType | null;
    resultForChoocsGroup!:{result:string, group:number, skipGroupForUserType :number | undefined} | undefined | null; 
}

// sub colection in survey collection
export class SurveyResult {
    queDocId!:string; 
    userDocId?:string;
    resultKey!:number | null;
    resultValue!:string;
    timeToAnswer!:number;
    queOrder!:number;
    queURLsOrder!:string;
}

// sub colection in survey collection
export class SurveyUser {
    timeToAnswer!:number;
    city!:string;
    age!:number
    gender!:string
    education!:string
    userType!:number;
}