import React from 'react';
import { Button, Text, View } from 'react-native';


type Props = {
  children: React.ReactNode;
}

type State = {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleTryAgain = () => {
    this.setState({ hasError: false });
  }
 

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>Oops, Something went wrong</Text>
          <Button color="#0B4A8B" title="Try Again" onPress={this.handleTryAgain} />
          
        </View>
      );
    }
    return this.props.children;
  }
}