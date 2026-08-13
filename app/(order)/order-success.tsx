import SuccessScreen from '@/components/Success';
import { Href } from "expo-router";
import React from "react";

interface SuccessScreenProps {
  headerText: string;
  subHeaderText: string;
  buttonText: string;
  route: Href; 
  
}

export default function OrderSuccess({}: SuccessScreenProps) {

    return (
        <SuccessScreen 
            headerText="Order Placed Successfully"
            subHeaderText="Your order has been received and is now pending approval. You can track it's progress in Orders Page."
            buttonText="View My Orders"
            route="/order"
        />
    )
    
}


