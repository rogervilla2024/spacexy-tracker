import React from 'react';
import { createGamePages } from '../../../../shared-core/pages/createGamePages';

const { TelegramBot } = createGamePages('spacexy');

export function TelegramBotPage() {
  return <TelegramBot />;
}

export default TelegramBotPage;
