import * as React from 'react';
import { QuestionData, QuestionDataStorage, QuestionTypeOptions, StorageQuestionResultPrefixKey, UrlForamtOptions } from '../data-types';
import { Box, Card, CardContent, CardMedia, FormControlLabel, Grid, Radio, RadioGroup, Slider, Stack, Typography } from '@mui/material';
import { UrlType } from '../firebaseModels';
import { FacebookEmbed, InstagramEmbed, LinkedInEmbed, PinterestEmbed, TikTokEmbed, XEmbed, YouTubeEmbed } from 'react-social-media-embed';
import { loadFromSessionStorage } from '../sessionStorage';

interface QuestionComponentProps {
    questionData:QuestionData;
    handleQuestionResult: (questionKey:string, answerId:number | null,answerValue:string | null, timeInMilsecToAnswer:number,queURLsOrder:string | null) => void;
}
  

export default function QuestionComponent(props :QuestionComponentProps) {

    const [result, setResult] = React.useState<string>("");
    const [startTime, setStartTime] = React.useState(new Date(Date.now()));
    const [valueSlider, setValueSlider] = React.useState<number>(
        props.questionData.data.sliderAnswer && 
        props.questionData.data.sliderAnswer.defaultValue !== undefined ?
         props.questionData.data.sliderAnswer.defaultValue : 0);
 
    /**
     * if question change so update result 
     */
    React.useEffect(()=>{
        setStartTime(new Date(Date.now()));
        setResult("");
        // get result from storage 
        const resultFormStorage = loadFromSessionStorage<QuestionDataStorage>(StorageQuestionResultPrefixKey +props.questionData.key );

        if(props.questionData.data.type === QuestionTypeOptions.CHOOSER) {
          
            if(resultFormStorage && resultFormStorage.answer && props.questionData.data.chooserAnswers?.filter(x=>x.id === resultFormStorage.answer?.id)?.length! > 0 ){
                setResult(resultFormStorage.answer.id?.toString()!);
            } else {
                if(props.questionData.answer && props.questionData.data.chooserAnswers?.filter(x=>x.id === props.questionData.answer?.id)?.length! > 0){
                    if(props.questionData.answer.id?.toString() !== result){ // change if has update
                        setResult(props.questionData.answer.id?.toString()!);

                    }
                } else {
                    // not result -
                    if(result !== ""){
                        setResult(""); // init result
                    }
                }
            }
        } 
        else if(props.questionData.data.type === QuestionTypeOptions.SILDER) {
            if(resultFormStorage?.answer?.value && resultFormStorage?.answer?.value  !== "" && !isNaN(Number(resultFormStorage?.answer?.value )) &&
                props.questionData.data.sliderAnswer?.minValue! <= Number(resultFormStorage?.answer?.value ) && 
                props.questionData.data.sliderAnswer?.maxValue! >= Number(resultFormStorage?.answer?.value )) {
                    setValueSlider(Number(resultFormStorage?.answer?.value));
            } else {
                setValueSlider(props.questionData.data.sliderAnswer?.defaultValue ? props.questionData.data.sliderAnswer.defaultValue : 0);
            }
        }
        props.questionData.data.URLs =  props.questionData.data.URLs ? props.questionData.data.URLs?.sort((a,b)=> {return 0.5-Math.random()}) : undefined!;

       
    },[props.questionData.key]);

    /**
     * result change so update the survey component
     */
    React.useEffect(()=>{
        if(result !== "" && !isNaN(Number(result))){
            const resultFormStorage = loadFromSessionStorage<QuestionDataStorage>(StorageQuestionResultPrefixKey +props.questionData.key );

            // handle chooser question result
            if(props.questionData.data.type === QuestionTypeOptions.CHOOSER) {
                if(resultFormStorage && resultFormStorage.answer?.id === Number(result) ) {
                    props.handleQuestionResult(
                        resultFormStorage.key,resultFormStorage.answer.id,
                        null, resultFormStorage.answer.timeToAnswer,
                        props.questionData.data.URLs?.length > 0 ? 
                        props.questionData.data.URLs?.map(url => url.id)?.toString() : null
                    )
                } else {
                    props.handleQuestionResult(
                        props.questionData.key, 
                        Number(result),
                        null,
                        (new Date(Date.now())).getTime() - startTime.getTime(),
                        props.questionData.data.URLs?.length > 0 ? 
                        props.questionData.data.URLs?.map(url => url.id).toString() : null);
                }
            }
            // handle slider question result 
            else if(props.questionData.data.type === QuestionTypeOptions.SILDER) {
                if(resultFormStorage && resultFormStorage.answer?.value && 
                    resultFormStorage.answer?.value !== "" && !isNaN(Number(resultFormStorage.answer?.value)) 
                    && Number(resultFormStorage.answer?.value) === Number(result) ) {
                    props.handleQuestionResult(resultFormStorage.key,null,
                        resultFormStorage.answer.value, resultFormStorage.answer.timeToAnswer,
                        props.questionData.data.URLs?.length > 0 ? 
                        props.questionData.data.URLs?.map(url => url.id).toString() : null)
                } else {
                    props.handleQuestionResult(
                        props.questionData.key, 
                        null,
                        result,  
                        (new Date(Date.now())).getTime() - startTime.getTime(),
                        props.questionData.data.URLs?.length > 0 ? 
                        props.questionData.data.URLs?.map(url => url.id).toString() : null);
                } 
            }
        }
    }, [result]);

    React.useEffect(()=>{
        if(props.questionData.data.type === QuestionTypeOptions.SILDER && valueSlider) {
            setResult(valueSlider.toString());
        }
    },[valueSlider]);

    const resultHandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setResult((event.target as HTMLInputElement).value);
    };

    const handleSliderValueChange = (event: Event, newValue: number | number[]) => {
        setValueSlider((newValue as number));
    };

    const getQuestionBgColor = () => {
        return props.questionData.bgColor ? props.questionData.bgColor  :  "rgb(162, 181, 235)";
    }

    const getUrlComponent =(url:UrlType) =>{
        if(url.data) {
            return (
                <Grid key={url.id} item xs={12} md={6} >
                    {
                    url.format === UrlForamtOptions.IMAGE ? 
                             <CardMedia sx={{height:'100%',width:'100%',objecFit:'contain'}}  
                             key={url.id} 
                             src={url.data} 
                             component={'img'} />//{url.format === UrlForamtOptions.IMAGE ? 'img' : 'iframe'} 
                    : 
                    url.data.toLowerCase().includes("instagram") ?
                        <Box sx={{ display: 'flex', justifyContent: 'center',backgroundColor:'white' }}>
                            <InstagramEmbed  url={url.data} width={'100%'} /> 
                        </Box>
                   : 
                    url.data.toLowerCase().includes("facebook") ?
                        <Box sx={{ display: 'flex', justifyContent: 'center',backgroundColor:'white' }}>
                            <FacebookEmbed url={url.data} width={'100%'} /> 
                        </Box>
                    :
                    url.data.toLowerCase().includes("linkedin") ?
                        <Box sx={{ display: 'flex', justifyContent: 'center',backgroundColor:'white' }}>
                            <LinkedInEmbed  url={url.data} width={'100%'} />
                        </Box> 
                    :
                    url.data.toLowerCase().includes("pinterest") ?
                        <Box sx={{ display: 'flex', justifyContent: 'center',backgroundColor:'white' }}>
                            <PinterestEmbed  url={url.data} width={'100%'} /> 
                        </Box> 
                    : 
                    url.data.toLowerCase().includes("tiktok") ?
                        <Box sx={{ display: 'flex', justifyContent: 'center',backgroundColor:'white' }}>
                            <TikTokEmbed   url={url.data} width={'100%'} />
                        </Box> 
                     : 
                    url.data.toLowerCase().includes("x") ||url.data.toLowerCase().includes("twitter")  ?
                        <Box sx={{ display: 'flex', justifyContent: 'center',backgroundColor:'white' }}>
                            <XEmbed   url={url.data} width={'100%'} /> 
                        </Box>
                    :
                    url.data.toLowerCase().includes("youtube") ?
                        <Box sx={{ display: 'flex', justifyContent: 'center',backgroundColor:'white' }}>
                            <YouTubeEmbed    url={url.data} width={'100%'} />
                        </Box> 
                    : null
                    }
                </Grid>
                );
        }
        return (<></>);
    }


    return (
        <Box sx={{ flexGrow: 1 }}>
            <Card sx={{ transition:'none', boxShadow:'none', borderRadius:'0',
                 bgcolor:getQuestionBgColor() }}>
              
              {props.questionData.data.descriptionTop ? 
               <Typography sx={{fontWeight:'bold',p:2}}>{props.questionData.data.descriptionTop}</Typography>
                : null
              }
                    <CardContent>
                        {props.questionData.data?.URLs?.length > 0 ?
                            <Grid container spacing={2}>
                                {props.questionData.data?.URLs?.map((url)=>{
                                    if(url.data && url.data !== ""){
                                        return(
                                           getUrlComponent(url)
                                        );
                                    } 
                                    return (null);
                                })}
                                </Grid> 
                        : null }
                    </CardContent>
                    {props.questionData.data.descriptionBottom ? 
                    <Typography sx={{fontWeight:'bold',p:2}}>{props.questionData.data.descriptionBottom}</Typography>
                    : null
                    }
            </Card>
            <Box sx={{   p: 2 }}>
                {props.questionData.data.type === QuestionTypeOptions.CHOOSER ? 
                    <RadioGroup value={result} onChange={resultHandleChange} >
                        {
                            props.questionData.data.chooserAnswers?.map(answer=>{
                                return(  <FormControlLabel key={answer.id} value={answer.id} control={<Radio />} label={answer.result} />); 
                            })
                        }
                    </RadioGroup>
                :
                    <Stack spacing={2} direction="row" sx={{ mb: 1, mt:3 }}  alignItems="center">
                        <span>{props.questionData.data.sliderAnswer !== null ? props.questionData.data.sliderAnswer?.titleStart : "" }</span>
                        <Slider aria-label="Volume" shiftStep={1} min={ props.questionData.data.sliderAnswer?.minValue} max={ props.questionData.data.sliderAnswer?.maxValue}
                                value= {valueSlider!} onChange={handleSliderValueChange} />
                        <span>{props.questionData.data.sliderAnswer !== null ? props.questionData.data.sliderAnswer?.titleEnd : "" }</span>
                    </Stack>
                }
            </Box>  
        </Box>         
    );
}