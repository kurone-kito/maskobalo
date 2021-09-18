import type { VFC } from 'react';
import { helloWorld } from '@maskobalo/common';
import React from 'react';

/**
 * Hello world コンポーネント。
 *
 * @returns コンポーネント。
 */
export const Hello: VFC = () => <>{helloWorld}</>;
Hello.displayName = 'Hello';

export default Hello;
