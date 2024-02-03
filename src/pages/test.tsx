import { trpc } from "@/lib/trpc/next-client";
import { Suspense, useState } from "react";

export default function TestPage() {
  const [text, setText] = useState("Tom");
  return (
    <div>
      <p className="font-bold">Hello worlds</p>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <Suspense fallback={<div>Loading...</div>}>
        <FetchingComponent text={text} />
      </Suspense>
    </div>
  );
}

function FetchingComponent({ text }: { text: string }) {
  // const [result, helloQuery] = trpc.hello.useSuspenseQuery({ text });
  const [data] = trpc.hello.useSuspenseQuery({ text });
  return <div>{data.greeting}</div>;
  // return <div>{result.greeting}</div>;
}
