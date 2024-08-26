import React, {useEffect, useState } from 'react';
import './App.css';
import { MilToSec, PersonalData, QuestionData, QuestionTypeOptions, StorageDoneMainSurveyKey, StorageSavePrevSurveyKey, StoragePresonalDataKey, StorageQuestionResultPrefixKey } from '../data-types';
import PersonalForm from '../components/PersonalForm';
import Survey from '../components/Survey';
import { SurveyResult } from '../firebaseModels';
import { Button, Container, Grid, Paper } from '@mui/material';
import { loadFromSessionStorage, saveToSessionStorae } from '../sessionStorage';
import { useNavigate } from 'react-router-dom';
import { getSurveyData, saveSurveyResults, saveUserData } from '../surveySystemService';
import { SurveyDetails  } from '../firebaseModels';
import Loading from '../components/Loding';


 function App() {

  const [isLoading , setIsLoading] = useState<boolean>(true);
  const [isDisabledDoneSurvey, setIsDisabledDoneSurvey] = useState<boolean>(false);
  const [surveyDetails, setSurveyDetails] = useState<SurveyDetails>();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [personalData, setPersonalData] = useState<null | PersonalData>(null); // result pernosal data 
  const [startTimeToAnswer, setStartTimeToAnswer ] = useState<number>(0);

  const [isPrevSurveyDone,setIsPrevSurveyDone] = useState<boolean>(false); // if the user dinish the survey
  const [isMainSurveyDone, setIsMainSurveyDone] = useState<boolean>(false);
  const [isSavePrevSurvy, setIsSavePrevSurvy] = useState<boolean>(false);
  const [questionsForPrevSurvey,setQuestionsForPrevSurvey ] = useState<QuestionData[]>([]);
  const [questionsForMainSurvey,setQuestionsForMainSurvey ] = useState<QuestionData[]>([]);

  const [haveTwoSurvies, setHaveTwoSurvies] = useState(false);

  const [isDonePersonalData,setIsDonePersonalData] = useState<boolean>(false); // if the user finish the pernsoal questions
  const [prevSurveyResults, setPrevSurveyResults] = useState<SurveyResult[]>([]); // results survey
  const [mainSurveyResults, setMainSurveyResults] = useState<SurveyResult[]>([]); // results main survey

  const navigate = useNavigate();

  /**
    * get question 
    */
  React.useEffect(()=>{
    setIsDisabledDoneSurvey(false);
    // load personal data from storage 
    const loadPersonalData = loadFromSessionStorage<PersonalData>(StoragePresonalDataKey);
    if(loadPersonalData) {
      personalDataIsDone(loadPersonalData);
    }

    const loadIsMainSurveyDone = loadFromSessionStorage<boolean>(StorageDoneMainSurveyKey);
    if(loadIsMainSurveyDone ) {
      navToDonePage(); 
    }
    
    // init survey
    getSurveyData().then(data=>{
      if(data && data.id && data.id !== "" && data.questions.length > 0) {
        // init survey details
        const details = new SurveyDetails();
        details.docId = data.id;
        details.title = data.title;  
        setSurveyDetails(details);

        // init questions 
        data.questions.forEach(x =>{
          setQuestions((que) => [ ...que , {
            key: x.queDocId,
            bgColor:undefined,
            data: x,
            answer: null
          }]);
        });

        setIsLoading(false);
      }
    })

  }, []);

  useEffect(()=>{
    if(questions.filter(x=>x.data.group !== 0).length > 0 && 
        questions.filter(x=>x.data.group === 0 && x.data.resultForChoocsGroup !== 
          undefined && x.data.resultForChoocsGroup !== null  && x.data.resultForChoocsGroup.group !== 0).length > 0) {
      setHaveTwoSurvies(true);
      setQuestionsForPrevSurvey(
        questions.filter(x=>x.data.group === 0).map(x=>{x.bgColor = 'rgb(227 216 181)'; return x;}).sort((a,b)=> {return 0.5-Math.random()}));
    } else {
      setQuestionsForMainSurvey(questions);
    }

  },[questions]);

  useEffect(()=>{
    // after init questions for prev survey check if user is clicked save prev survey 
    if(questionsForPrevSurvey.length > 0 ) {
      const loadIsPrevSurveySave = loadFromSessionStorage<boolean>(StorageSavePrevSurveyKey);
      if(loadIsPrevSurveySave) {
        getQuestionForMainSurveyByPrev();
      }
    }
  },[questionsForPrevSurvey])

  /**
   * save personal Data 
   * @param personalData 
   */
  const personalDataIsDone = (personalData : PersonalData) =>{
    if(personalData){
      setIsDonePersonalData(true);
      saveToSessionStorae<PersonalData>(StoragePresonalDataKey,personalData);
      setPersonalData(personalData);
      setStartTimeToAnswer((new Date(Date.now())).getTime());
    }
  }
  /**
   * save prev survey 
   */
  const savePrevSurvyClicked = () =>{
    if(isPrevSurveyDone) {
      getQuestionForMainSurveyByPrev();
    }
   
  }

  const getQuestionForMainSurveyByPrev = () =>{
    // init the main survey 
 
    const temp = questionsForPrevSurvey.filter(x=>x.data?.resultForChoocsGroup  && x.data.resultForChoocsGroup?.group !== 0);
    if(temp.length > 0) {
      if( (temp[0].data.type === QuestionTypeOptions.SILDER &&  temp[0].answer?.value === temp[0].data.resultForChoocsGroup?.result) ||
          (temp[0].data.type === QuestionTypeOptions.CHOOSER &&  temp[0].answer?.id?.toString() === temp[0].data.resultForChoocsGroup?.result)) {
       
            setQuestionsForMainSurvey(questions.filter(x=>x.data.group === temp[0].data.resultForChoocsGroup?.group).sort((a,b)=> {return 0.5-Math.random()}));
      } else {
        setQuestionsForMainSurvey(questions.filter(x=>temp[0].data.resultForChoocsGroup?.group !== x.data.group && x.data.group !== 0 )?.sort((a,b)=> {return 0.5-Math.random()}));
      }
    }
    setIsSavePrevSurvy(true);
    saveToSessionStorae(StorageSavePrevSurveyKey, true); // isPrevSurveyDone storage true value
  }

  /// click on finish to answer all - save to DB 
  const onSendSurvyClicked = () =>{

    if(surveyDetails && surveyDetails.docId && personalData) {
      setIsDisabledDoneSurvey(true);
      setIsLoading(true);
      
      //save user data 
      saveUserData(surveyDetails.docId,{
        timeToAnswer:((new Date(Date.now())).getTime() - startTimeToAnswer) * MilToSec,
        city:personalData.city,
        age:personalData.age,
        gender:personalData.gender,
        education:personalData.education
      })
      .then(userId=>{
        // add userId to results
        if(userId) {
          const prevResults = prevSurveyResults.map(x=> {
            x.userDocId = userId;
            return x;
          });
          const mainREsults = mainSurveyResults.map(x=> {
            x.userDocId = userId;
            return x;
          });
          const results = [...prevResults, ...mainREsults];
          saveSurveyResults(surveyDetails.docId, results).then(val=>{
            if(val){
              setIsDisabledDoneSurvey(false);
              setIsLoading(false);
              /// stop loading
              saveToSessionStorae(StorageDoneMainSurveyKey, true);
              navToDonePage();
            } else {
              throw new Error("can't save data");
            }
          })
        } else {
          throw new Error("Can't save data");
        }
      });    
    } else {
      throw new Error("Can't save data");
    }
    console.log(personalData);
    console.log(prevSurveyResults);
    console.log(mainSurveyResults);

  }

  // go to done page 
  const navToDonePage = () =>{
    navigate('/done',{state:{type:'done'}});
  }

  return (

    <Container  fixed>
      <Paper   sx={{ p: 2, margin: 'auto', maxWidth: 1000, maxHeight: 1000, flexGrow: 1  }} >
        {
          isLoading ?  <Loading /> 
          :
          <>
            {/* header */}
            <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" >
              <h1>ברוכים הבאים לסקר</h1>
              <h2>{surveyDetails?.title}</h2>     
            </Grid>

            {/* body */}

            <Grid container spacing={0} sx={{width:"100%"}}>
              { !isDonePersonalData ? 
                  <PersonalForm personalDataIsDone={personalDataIsDone} /> 
                  : 
                  haveTwoSurvies && !isSavePrevSurvy ? 
                  <>
                  <Grid container >
                    <Survey questions={questionsForPrevSurvey} setSurveyResults={setPrevSurveyResults} setIsSurveyDone={setIsPrevSurveyDone} />
                  </Grid>
                  <Grid container  direction="column" justifyContent="center" alignItems="center" >
                    <Button
                      disabled={!isPrevSurveyDone}
                      onClick={savePrevSurvyClicked}
                      type="button"
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                    >
                    שמור
                    </Button>
                  </Grid>
                  </> : questionsForMainSurvey.length >0 ? 

                  <Survey questions={questionsForMainSurvey} setSurveyResults={setMainSurveyResults} setIsSurveyDone={setIsMainSurveyDone} /> 
                  : <></>
                  
              }
            </Grid>

            {/* footer */}
            <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" sx={{marginBlockStart:'1em'}} >
              <Button  
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={onSendSurvyClicked}
                disabled={!isMainSurveyDone || !isDonePersonalData || isDisabledDoneSurvey}>סיום סקר</Button>
            </Grid>
          </>

        }
      </Paper>
    </Container>
  );
}
export default App;