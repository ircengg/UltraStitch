
import { Container, Text, Title, Button, Stack, Center } from '@mantine/core';


const ErrorPage = () => {
  

  return (
    <Container size="sm" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Stack align="center" spacing="lg">
        <Title order={2} align="center" style={{ color: '#ff6b6b' }}>
          AUT Data Not Found
        </Title>
        <Text align="center" size="lg" color="dimmed">
          The requested data is unavailable. Please ensure you have selected the correct scan ID or try again later.
        </Text>      
      </Stack>
    </Container>
  );
};

export default ErrorPage;
