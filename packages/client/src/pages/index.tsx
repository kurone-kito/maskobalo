import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { helloWorld } from '@maskobalo/common';

/**
 * Hello world ページ。
 *
 * @returns ページのレンダリング結果。
 */
const Page: NextPage = () => (
  <>{useRouter().isFallback ? 'Loading...' : helloWorld}</>
);
Page.displayName = 'Index';

export default Page;
