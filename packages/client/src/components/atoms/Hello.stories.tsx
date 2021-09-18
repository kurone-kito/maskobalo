import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { Hello } from './Hello';

/** コンポーネントの型定義。 */
type Component = typeof Hello;

/** ストーリーのメタデータ。 */
export default Object.freeze<ComponentMeta<Component>>({
  component: Hello,
  title: `atoms/${Hello.displayName}`,
});

/**
 * ストーリーの共通となるテンプレート。
 *
 * @returns テンプレート コンポーネント。
 */
const Template: ComponentStory<Component> = () => <Hello />;

/**
 * 既定のストーリー。
 *
 * 名前は必ず Default である必要はありません。
 */
export const Default = Template.bind({});
Default.args = {};
