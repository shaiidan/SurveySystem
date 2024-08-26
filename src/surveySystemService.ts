import { SurveyData } from './data-types';
import { SurveyQuestion, SurveyResult, SurveyUser } from './firebaseModels';
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
                questions: questionsData.docs.map((doc => ({
                    ...doc.data(),
                    queDocId:doc.id
                } as SurveyQuestion)))
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
                    timeToAnswer:result.timeToAnswer
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