import { Button, Container, Group, Text } from '@mantine/core';
import { GithubIcon } from '@mantinex/dev-icons';
import '@/styles/home.css';

const HomePage: React.FC = () => {
  return (
    <div className="wrapper">
      <Container size={800} className="inner">
        <h1 className="title">

          <Text component="span" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} inherit>
            Hello everyone,
          </Text> <br/>
          Welcome to my website
        </h1>

        <Text className={"description"} c="dimmed">
          Here, a little glimpse into my daily life!
        </Text>

        <Group className="controls">
          <Button
            size="xl"
            className="control"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Get started
          </Button>

          <Button
            component="a"
            href="https://github.com/nldq092203"
            size="xl"
            variant="default"
            className="control"
            leftSection={<GithubIcon size={20} />}
          >
            GitHub
          </Button>
        </Group>
      </Container>
    </div>
  );
}

export default HomePage;