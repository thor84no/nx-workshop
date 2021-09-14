import { Story, Meta } from '@storybook/react';
import { Header } from './header';

export default {
  component: Header,
  title: 'Header',
} as Meta;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Template: Story<any> = (args) => <Header {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
