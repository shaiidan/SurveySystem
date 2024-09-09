import { SurveyData } from './data-types';
import { ChooserAnswerType, SurveyQuestion, SurveyResult, SurveyUser, UrlType } from './firebaseModels';
import {db } from './firebaseConfig';
import { collection, query, where, getDocs,  doc, getDoc, addDoc} from "firebase/firestore";


const SURVEYS_COLLECTION_NAME = "Surveys";
const USERS_SUBCOLLECTION_NAME = "users";
const RESULTS_SUBCOLLECTION_NAME = "results";
const QUESTINONS_SUBCOLLECTION_NAME = "questions";

/**
 * get first isActive survey data 
 */
export const getSurveyData  = async () => {

    try {
        const q = query(collection(db,SURVEYS_COLLECTION_NAME), where("isActive", "==", true));
        const querySnapshot = await getDocs(q);
        if(querySnapshot.size > 0 ){
            ///Surveys/fpZaGg8UxuXhayTR771s/questions
            const questionsData =  await getDocs(collection(db,`${SURVEYS_COLLECTION_NAME}/${querySnapshot.docs[0].id}/${QUESTINONS_SUBCOLLECTION_NAME}`));
            const surveyData :SurveyData = {
                id:querySnapshot.docs[0].id,
                title: querySnapshot.docs[0].data()['title'] as string,
                questions: getCurrectQuestions(questionsData.docs.map((doc => ({
                    ...doc.data(),
                    queDocId:doc.id
                } as SurveyQuestion)))?.filter(q => checkQuestion(q)))
            }
            return surveyData;
        }
        else {
            return undefined;
        }
    }

    catch(error) {
        return undefined;
    }
}

/**
 * get only questions with URLS and chooser answers where correctly defined
 * @param questions 
 * @returns 
 */
const getCurrectQuestions = (questions:SurveyQuestion[]) => {
    const newQuestions:SurveyQuestion[] = [];
    questions.forEach(question =>{
        // urls
        const newQuestion:SurveyQuestion = structuredClone(question);
        if(question.URLs) {
            newQuestion.URLs = 
            Array.from(question.URLs.filter(url=> (url.id !== undefined && url.id !==  null) && (url.data !== undefined && url.data !==  null) 
             && (url.format === 'img' || url.format ===  'other') ).reduce((uniq, curr) => {
                if (!uniq.has(curr['id'])) {
                  uniq.set(curr['id'], curr);
                }
                return uniq;
              }, new Map<any,UrlType>())
              .values());
        }

        if(question.type === 1 && question.chooserAnswers) {
            newQuestion.chooserAnswers = 
            Array.from(question.chooserAnswers.filter(answer=> (answer.id !== undefined && answer.id !== null) &&
             (answer.result !== undefined && answer.result !==  null) ).reduce((uniq, curr) => {
                if (!uniq.has(curr['id'])) {
                  uniq.set(curr['id'], curr);
                }
                return uniq;
              }, new Map<any,ChooserAnswerType>())
              .values());
        }
        newQuestions.push(newQuestion);
    });
    return newQuestions;
} 

/**
 * check if question correctly defined
 * @param question 
 * @returns 
 */
const checkQuestion = (question : SurveyQuestion) => {
    
    if(!question.queDocId) return false;
    if(question.group !== 0 && question.group !== 1 && question.group !== 2 ) return false;
    if(question.resultForChoocsGroup && ((question.resultForChoocsGroup.result === undefined  || question.resultForChoocsGroup.result === null) ||
        (question.resultForChoocsGroup.group !== 1 && question.resultForChoocsGroup.group !== 2))) return false;
    if(question.type !== 1 && question.type !== 2) return false;
    if(question.type === 1 && !question.chooserAnswers) return false;
    if(question.type === 2 && !question.sliderAnswer) return false;
    if(question.type === 2 && question.sliderAnswer) {
        if(!question.sliderAnswer.titleStart || !question.sliderAnswer.titleEnd || question.sliderAnswer.minValue === undefined   || question.sliderAnswer.minValue === null
            || question.sliderAnswer.maxValue === undefined   || question.sliderAnswer.maxValue === null  ) return false;
    }

    return true;
}


/**
 * create user 
 * @param userData 
 * @returns 
 */
export const saveUserData = async (surveyDocId:string, userData:SurveyUser) => {

    try {
        if(await isDocIdExistInPath(SURVEYS_COLLECTION_NAME,surveyDocId)) {
            const usersCollectionRef =  collection(db,`${SURVEYS_COLLECTION_NAME}/${surveyDocId}/${USERS_SUBCOLLECTION_NAME}`);
        
            const newUser = await addDoc(usersCollectionRef, {
                timeToAnswer:userData.timeToAnswer,
                city:userData.city,
                age:userData.age,
                gender:userData.gender,
                education:userData.education
            });

            return newUser.id; 
        }
        return null;
    }
    catch(error){
        return null;
    }
}

/**
 * save result 
 * @param surveyDocId 
 * @param results 
 * @returns 
 */
export const saveSurveyResults = async (surveyDocId:string, results :SurveyResult[]) =>{
    try {
        if(await isDocIdExistInPath(SURVEYS_COLLECTION_NAME,surveyDocId)) {
            const resultsRef = collection(db,`${SURVEYS_COLLECTION_NAME}/${surveyDocId}/${RESULTS_SUBCOLLECTION_NAME}`);
            results.forEach(async result => {
                await addDoc(resultsRef, {
                    queDocID:result.queDocId,
                    userDocId:result.userDocId,
                    resultKey:result.resultKey,
                    resultValue:result.resultValue,
                    timeToAnswer:result.timeToAnswer,
                    queOrder:result.queOrder,
                    queURLsOrder:result.queURLsOrder
                });
            });
            return true;
        }
        return false;
    }
    catch(error) {
        return false;
    }
}




/**
 * 
 * @param colectionPath 
 * @param docId 
 * @returns 
 */
const isDocIdExistInPath = async (colectionPath:string, docId:string) => {
    try {
        const docRef = doc(db, colectionPath, docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return true;
        } 
        return false;
    }
    catch(error) {
        return false;
    }
 }