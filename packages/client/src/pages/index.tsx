import type { NextPage } from 'next';
import { useRouter } from 'next/router';

/**
 * Hello world ページ。
 *
 * @returns ページのレンダリング結果。
 */
const Page: NextPage = () => (
  <>{useRouter().isFallback ? 'Loading...' : 'Hello, world!'}</>
);
Page.displayName = 'Index';

export default Page;
