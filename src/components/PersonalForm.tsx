import * as React from 'react';
import {useEffect, useState } from 'react';
import { PersonalData } from '../data-types';
import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';
import Cities from "../assets/cities-Israel.json";

const GenderOptions: {key:number, value:string}[] =[
    {key:1, value:"זכר"},
    {key:2, value:"נקבה"},
    {key:3, value:"אחר"},
    
]
const EducationOptions: {key:number, value:string}[] =[
    {key:1, value:"ללא השכלה"},
    {key:2, value:"תיכוני"},
    {key:3, value:"אקדמאי"},
    {key:4, value:"תעודה"},
    
]

interface PersonalFormProps {
    personalDataIsDone:(personalData : PersonalData) => void;
}

export default function PersonalForm(props :PersonalFormProps) {

    const [age, setAge] = useState<string>("");
    const [hasAgeError, setHasAgeError] = useState<boolean>(false);
    const [gender, setGender] = useState<string>("");
    const [hasGenderError, setHasGenderError] = useState<boolean>(false);
    const [education, setEducation] = useState<string>("");
    const [hasEducationError, setHasEducationError] = useState<boolean>(false);
    const [city, setCity] = useState<string>("");
    const [hasCityError, setHasCityError] = useState<boolean>(false);
    const [cities, setCities] = useState<{key:number, value:string}[]>([]);
    const [disabledSendBtn, setDisabledSendBtn] = useState(true);

    useEffect(()=>{
      if(Cities.result.records instanceof Array && cities.length === 0){
        const temp :{key:number, value:string}[] = [];
        (Cities.result.records as Array<any>  ).forEach(x=>{
            temp.push({
                key: temp.length +1,
                value:(x["שם_ישוב"] as String).trim()
                }
            );
        });
        setCities(temp);
    }
        
    }, []);

    useEffect(()=>{
      setDisabledSendBtn(isDisabledSendBtn());
    }, [city,education,age,gender])

    const handleSubmit =(event:any) =>{
        event.preventDefault();

        if(!isNaN(Number(age)) && Number(age) !== 0 &&  gender && city && education && gender.length >0 && city.length >0 && education.length>0){
            props?.personalDataIsDone({
                age:Number(age),
                gender:gender,
                city:city,
                education:education
            })
        }
    }

    const onChangedAge = (event:any) =>{
        setAge(event?.target?.value)
        if (event?.target?.validity?.valid && !isNaN(event?.target?.value)) {
            setHasAgeError(false);
          } else {
            setHasAgeError(true);
          }
    }

    const onChangeGender = (event:any) => {
      setGender(event.target.value);
      if(event && event.target && event.target.value && event.target.value.length && event.target.value.length > 0) {
        setHasGenderError(false);
      } else {
        setHasGenderError(true);
      }
    }

    const onChangeCity = (event:any) => {
      setCity(event.target.value);
      if(event && event.target && event.target.value && event.target.value.length && event.target.value.length > 0) {
        setHasCityError(false);
      } else {
        setHasCityError(true);
      }
    }

    const onChangeEducation = (event:any) =>{
      setEducation(event.target.value);
      if(event && event.target && event.target.value  && event.target.value.length > 0) {
        setHasEducationError(false);
      } else {
        setHasEducationError(true);
      }
    }

    const checkIsDefaultValues = () => {
      return city === "" || gender === ""  || age === "" || city === "";
    }

    const isDisabledSendBtn = () =>{
      return checkIsDefaultValues() || hasCityError || hasAgeError || hasGenderError || hasEducationError;
    }


    return (
        <>
          <Box component="form" noValidate onSubmit={handleSubmit}  sx={{ mt: 3, width:"100%" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} >
                <TextField 
                  type='number'
                  InputProps={{
                    inputProps: { 
                        max: 100, min: 10 
                    }
                  }}
                  name="age"
                  fullWidth
                  value={age}
                  onChange={onChangedAge}
                  error={hasAgeError}
                  helperText={
                    hasAgeError ? "נא הקלד גיל בטווח בין 10 ל-100" : ""
                  }
                  onFocus={(event:any)=>{age === "" ? setHasAgeError(true) : setHasAgeError(false) }}
                  label="גיל"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  error={hasGenderError}
                  onFocus={(event:any)=>{gender === "" ? setHasGenderError(true) : setHasGenderError(false) }}
                  helperText={
                    hasGenderError ? "חייב לבחור אחר ברשימה" : ""
                  }
                  fullWidth
                  label="מגדר"
                  name="gender"
                  value={gender}
                  onChange={onChangeGender}
                  select
                >
                    {
                        GenderOptions.map((option) => (
                            <MenuItem key={option.key} value={option.value}>
                              {option.value}
                            </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField 
                  error={hasEducationError}
                  onFocus={(event:any)=>{education === "" ? setHasEducationError(true) : setHasEducationError(false) }}
                  helperText={
                    hasEducationError ? "חייב לבחור אחר ברשימה" : ""
                  }
                  fullWidth
                  label="השכלה"
                  name="education"
                  value={education}
                  onChange={onChangeEducation}
                  select
                >
                    {
                        EducationOptions.map((option) => (
                            <MenuItem key={option.key} value={option.value}>
                              {option.value}
                            </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
              <TextField 
                  error={hasCityError}
                  onFocus={(event:any)=>{city === "" ? setHasCityError(true) : setHasCityError(false) }}
                  helperText={
                    hasCityError ? "חייב לבחור אחר ברשימה" : ""
                  }
                  fullWidth
                  label="עיר"
                  name="city"
                  value={city}
                  onChange={onChangeCity}
                  select
                >
                    {
                        cities.map((option) => (
                            <MenuItem key={option.key} value={option.value}>
                              {option.value}
                            </MenuItem>
                    ))}
                </TextField>
              </Grid>
            
            </Grid>
            <Button
              disabled={disabledSendBtn}
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              שמור
            </Button>
          </Box>

        </>
    );
}
