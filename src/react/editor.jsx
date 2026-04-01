import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from '@codemirror/lang-javascript';
import * as sparkplugB from '@jcoreio/sparkplug-payload/spBv1.0';

import { useState } from "react";

import DecoderBase64 from "./decoder-base-64";
import DecoderFile from "./decoder-file";

const defaultCode =
  `{
  metrics: [{
    type: 'Double',
    name: 'test-value',
    value: 10,
  }],
  timestamp: ${new Date().valueOf()},
}
`;

export default function Editor() {
  const [code, setCode] = useState(defaultCode);
  const [baseValue, setBaseValue] = useState('');
  const [err, setErr] = useState(false);
  const [success, setSucess] = useState(false);

  const onChange = (i) => {
    setCode(i);
  }

  const encode = () => {
    try {
      const codified = new Function(`return (${code})`)();
      const encoded = sparkplugB.encodePayload(codified);
      setErr(false);
      return encoded;

    } catch (err) {
      setErr(true);
      return false;
    }
  }

  const onClickCopy = () => {
    const res = encode();
    if (res) {
      navigator.clipboard.writeText(res.toBase64());
      setSucess(true);
      setTimeout(() => {
        setSucess(false);
      }, 3000);
    }
  }

  const onClickDownload = () => {
    const res = encode();
    if (!res) return;
    const blob = new Blob([res], { type: 'application/octet-stream' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = 'encoded-payload.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }


  return (<div className="flex-col lg:flex-row flex gap-8 lg:gap-4">
    <div className="flex-1 flex flex-col gap-4">
      <h3 className="text-center text-xl">
        Encoder
      </h3>
      <CodeMirror height="500px" theme={vscodeDark} value={code} extensions={[javascript({ jsx: true })]} onChange={onChange} />
      {err && (
        <p className="text-red-400">
          Could not encode invalid JS Object
        </p>
      )}
      {success && (
        <p className="text-green-400">
          Encoded payload copied to clipboard
        </p>
      )}
      <div className="flex justify-start gap-4">
        <button className="cursor-pointer bg-green-900 px-4 py-2 rounded-2xl shadow-lg" onClick={onClickCopy}>
          Copy encoded Base64
        </button>
        <button className="cursor-pointer bg-orange-800 px-4 py-2 rounded-2xl shadow-lg" onClick={onClickDownload}>
          Download encoded Binary
        </button>
      </div>
    </div>
    <div className="flex-1 flex flex-col gap-4">
      <DecoderBase64 />
      <DecoderFile />
    </div>
  </div>)
}
