import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Hello } from '../components/atoms/Hello';

/**
 * Hello world ページ。
 *
 * @returns ページのレンダリング結果。
 */
const Page: NextPage = () =>
  useRouter().isFallback ? <>Loading...</> : <Hello />;
Page.displayName = 'Index';

export default Page;
