import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { TicTacToe } from '../components/tic-tac-toe';
import '../global.css';

export default component$(() => {
  return <TicTacToe />;
});

export const head: DocumentHead = {
  title: "Tic Tac Toe - Interactive Game",
  meta: [
    {
      name: "description",
      content: "Play Tic Tac Toe against AI or friends with advanced features",
    },
  ],
};
