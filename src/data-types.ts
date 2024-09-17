import { SurveyQuestion  } from "./firebaseModels";
export const MilToSec:number = 0.001;
export const StoragePresonalDataKey = "UserDetials";
export const StorageQuestionResultPrefixKey = "Question_";
export const StorageSavePrevSurveyKey  = "IsPrevSurveySave";
export const StorageDoneMainSurveyKey  = "IsMainSurveyDone";
export const StorageUserTypeKey = "UserType";


export enum UrlForamtOptions {
    IMAGE = "img",
    OTHER = "other"
}
export enum QuestionTypeOptions {
    CHOOSER = 1,
    SILDER = 2
}
export interface PersonalData {
    age:number;
    city:string;
    gender:string
    education:string
}

export interface SurveyData {
    id:string;
    title:string;
    countUserType:number;
    questions: SurveyQuestion[];
}

export interface QuestionData {
    key:string;
    data:SurveyQuestion;
    bgColor:string | undefined;
    answer: {id:number | null,  value:string, timeToAnswer:number  } | null;
    queURLsOrder:string | null;
}

export interface QuestionDataStorage {
    key:string;
    answer: {id:number | null, value:string |null,  timeToAnswer:number } | null;
}
