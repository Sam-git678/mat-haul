
import SuccessScreen from '@/components/Success';
import { Href } from "expo-router";
import React from "react";

interface SuccessScreenProps {
  headerText: string;
  subHeaderText: string;
  buttonText: string;
  route: Href; 
  onPress?: () => void;
}

export default function SignupSuccess({}: SuccessScreenProps) {

    return (
        <SuccessScreen 
            headerText="Congratulations! Your Account has been Successfully Created"
            subHeaderText="You're all set to start ordering materials and managing your wallet."
            buttonText="Continue"
            route="/login"
        />
    )
    
}


