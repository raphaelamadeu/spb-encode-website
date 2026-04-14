import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from '@codemirror/lang-javascript';
import { json as jsonLang } from '@codemirror/lang-json';
import * as sparkplugB from '@jcoreio/sparkplug-payload/spBv1.0';
import { EditorView } from "@codemirror/view";
import JSON5 from 'json5';

import { useEffect, useRef, useState } from "react";

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

const localStorageKey = 'editor.value';

function formatJSON(editor, value) {
  try {
    const formatted = JSON.stringify(JSON.parse(value), null, 2);

    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: formatted,
      },
    });
  } catch (e) {
    console.error("JSON inválido");
  }
}

export default function Editor() {
  const [code, setCode] = useState(defaultCode);
  const [err, setErr] = useState(false);
  const [success, setSucess] = useState(false);
  const [decodedCode, setDecodedCode] = useState('');
  const viewRef = useRef(null);

  useEffect(() => {
    formatJSON(viewRef.current, decodedCode)
  }, [decodedCode, viewRef])

  useEffect(() => {
    const cached = window.localStorage.getItem(localStorageKey);
    if (cached) setCode(cached);
  }, [])

  const onChange = (i) => {
    setCode(i);
  }

  const encode = () => {
    try {
      const json = JSON5.parse(code);
      const encoded = sparkplugB.encodePayload(json);
      setErr(false);
      window.localStorage.setItem(localStorageKey, code);
      return encoded;

    } catch (err) {
      console.log(err)
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


  return (
    <>
      <div className="flex-col lg:flex-row flex gap-8 lg:gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <h3 className="text-center text-xl">
            Encoder
          </h3>
          <CodeMirror maxWidth="100%" height="500px" theme={vscodeDark} value={code} extensions={[javascript({ jsx: true })]} onChange={onChange} />
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
          <DecoderBase64 setDecodedCode={(value) => {
            setDecodedCode(value);
            formatJSON(viewRef, value)
          }} />
          <DecoderFile setDecodedCode={(value) => {
            setDecodedCode(value);
            formatJSON(viewRef, value)
          }} />
        </div>
      </div>

      {decodedCode && <>
        <hr className="opacity-60 my-8" />

        <div className="flex-col lg:flex-row flex gap-8 lg:gap-4">
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-center text-xl">
              Decoded viewer
            </h3>
            <CodeMirror value={`${JSON.stringify(JSON.parse(decodedCode), null, 2)}`} height="500px" theme={vscodeDark} extensions={[jsonLang(), EditorView.lineWrapping]} />
          </div>
        </div>
      </>}
    </>)
}
