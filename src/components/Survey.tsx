import * as React from 'react';
import { SurveyResult } from '../firebaseModels';
import { MilToSec, QuestionData, QuestionDataStorage, StorageQuestionResultPrefixKey, QuestionTypeOptions } from '../data-types';
import QuestionComponent from './QuestionComponent'
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Loading from './Loding';
import { saveToSessionStorae } from '../sessionStorage';

interface SurveyProps {
    questions:QuestionData[];
    setIsSurveyDone:(isSurveyDone:boolean)=> void;
    setSurveyResults:(results:SurveyResult[]) => void;
}
  

export default function Survey(props :SurveyProps) {
    const theme = useTheme();
    const [queToShow, setQueToShow] = React.useState<QuestionData>();
    const [activeStep, setActiveStep] = React.useState(0);
    const [maxSteps, setMaxSteps] = React.useState(0);
    const [disabledNextBtn, setDisabledNextBtn] = React.useState(true); 

    React.useEffect(()=>{
        setActiveStep(0);
        setDisabledNextBtn(true);
        setMaxSteps(props.questions.length );
        setQueToShow(props.questions[activeStep]);
    },[props.questions]);

    React.useEffect(()=>{

        if(queToShow && !queToShow.answer  && queToShow.data.isRequire) {
            setDisabledNextBtn(true);
        } else {
            setDisabledNextBtn(false);
        }
    },[queToShow?.key]);

    /**
     * active step change to update question to show 
     */
    React.useEffect(()=>{
        setQueToShow(props.questions[activeStep]);
        if(activeStep === props.questions.length -1) {
            handleFinishToAnswer();
        }
       
    },[activeStep]);

    /**
     * the user click next 
     */
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };


    /**
     * the user click prev
     */
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    /**
     * update the result question
     * @param questionKey 
     * @param answerId 
     */
    const handleQuestionResult = (questionKey:string, answerId:number | null,answerValue:string | null, timeInMilsecToAnswer:number) =>{
        const index = props.questions.findIndex(x=>x.key === questionKey);
        if(index !== -1){
            // handle to chooser question 
            if(props.questions[index].data.type === QuestionTypeOptions.CHOOSER && answerId) {
                const resultValue = queToShow?.data.chooserAnswers?.find(x=>x.id === answerId)?.result;
                if( resultValue){
                    props.questions[index].answer = {
                        id:answerId,
                        value:resultValue,
                        timeToAnswer: timeInMilsecToAnswer * MilToSec
                    };
        
                    // save result to storage
                    saveToSessionStorae<QuestionDataStorage>(`${StorageQuestionResultPrefixKey}${props.questions[index].key}`,{
                        key: props.questions[index].key, 
                        answer: {
                            id:props.questions[index].answer?.id!, 
                            value:null,
                            timeToAnswer: props.questions[index].answer?.timeToAnswer!} 
                        }
                    );
                    setDisabledNextBtn(false); // update next button 
                } else {
                    setDisabledNextBtn(true); // update next button 
                }
            } 
            // handle for silder question 
            else if(props.questions[index].data.type === QuestionTypeOptions.SILDER && props.questions[index].data.sliderAnswer !== null ) {
                if(answerValue !== null && answerValue !== "" && !isNaN(Number(answerValue))
                         && props.questions[index].data.sliderAnswer?.minValue! <= Number(answerValue) && 
                         props.questions[index].data.sliderAnswer?.maxValue! >= Number(answerValue) ) {

                            props.questions[index].answer = {
                                id:null,
                                value:answerValue,
                                timeToAnswer: timeInMilsecToAnswer * MilToSec
                            };
                
                            // save result to storage
                            saveToSessionStorae<QuestionDataStorage>(`${StorageQuestionResultPrefixKey}${props.questions[index].key}`,{
                                key: props.questions[index].key, 
                                answer: {
                                    id:null, 
                                    value:answerValue,
                                    timeToAnswer: props.questions[index].answer?.timeToAnswer!} 
                                }
                            );
                            setDisabledNextBtn(false); // update next button 
                } else {
                    setDisabledNextBtn(true); // update next button 
                }
            }
            if(activeStep === props.questions.length -1) {
                handleFinishToAnswer();
            }
        }
    }

    /**
     * build the array for save the data in DB
     */
    const handleFinishToAnswer = () =>{
         // check if the user has answered  all mandatory questions

         if(props.questions.filter(x=>x.data.isRequire === true && (x.answer === null || x.answer.value === "")).length === 0){

            const results :SurveyResult[] = [];
            props.questions.filter(x=>x.answer !== null && x.answer.value !== "").forEach(question=>{
                if(question.answer?.value) {
                    results.push({
                       // surveyID:question.data.surveyID,
                        queDocId:question.data.queDocId,
                        resultKey: question.answer?.id!,
                        resultValue: question.answer?.value!,
                        timeToAnswer:question.answer?.timeToAnswer!
                    });
                }
            });
            props.setSurveyResults(results)
            props.setIsSurveyDone(true);
        }
    }

    return (
        <>
        {
        queToShow !== undefined ? 
        (
            <Box sx={{ flexGrow: 1 }}>
                <Box sx={{overflowY:'auto', maxHeight:queToShow?.data.URLs && queToShow?.data.URLs?.length > 0 ? 600 : 400 ,
                     height: queToShow?.data.URLs && queToShow?.data.URLs?.length > 0 ? 400 : 200 , p: 2 }}>
                        <QuestionComponent questionData={queToShow} handleQuestionResult={handleQuestionResult} />
                </Box>
            
                <MobileStepper
                    variant="progress"
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    sx={{  flexGrow: 1 }}
                    nextButton={
                    <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps-1 || disabledNextBtn}>
                    הבא
                    {theme.direction === 'rtl' ? (
                        <KeyboardArrowLeftIcon />
                    ) : (
                        <KeyboardArrowRightIcon />
                    )}
                    </Button>
                    }
                    backButton={
                        <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                        {theme.direction === 'rtl' ? (
                            <KeyboardArrowRightIcon />
                        ) : (
                            <KeyboardArrowLeftIcon />
                        )}
                        הקודם
                        </Button>
                    }
            />
        </Box>
    )
        : 
    <Loading />
    }
        </>
    );
}