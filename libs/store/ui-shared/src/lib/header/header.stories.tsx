import { Story, Meta } from '@storybook/react';
import { Header } from './header';

export default {
  component: Header,
  title: 'Header',
} as Meta;

const Template: Story<any> = (args) => <Header {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
