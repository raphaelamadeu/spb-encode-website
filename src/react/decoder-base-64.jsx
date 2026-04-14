import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { EditorView } from "@codemirror/view";

import { useEffect, useState } from "react";

import * as sparkplugB from '@jcoreio/sparkplug-payload/spBv1.0';

const defaultValue = 'CO/J9rHUMxIZCgp0ZXN0LXZhbHVlIAo4AGkAAAAAAABZQA==';

const localStorageKey = 'base64.value';

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);

  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

export default function DecoderBase64({ setDecodedCode }) {
  const [baseValue, setBaseValue] = useState(defaultValue);
  const [err, setErr] = useState(false);
  const [success, setSucess] = useState(false);

  useEffect(() => {
    const cached = window.localStorage.getItem(localStorageKey);
    if (cached) setBaseValue(cached);
  }, []);

  const decode = () => {
    try {
      const binary = base64ToArrayBuffer(baseValue);
      const decoded = sparkplugB.decodePayload(binary);
      setErr(false);
      window.localStorage.setItem(localStorageKey, baseValue);
      return JSON.stringify(decoded, (_, value) =>
        typeof value === 'bigint' ? Number(value) : value
      );;

    } catch (err) {
      console.log(err)
      setErr(true);
      return false;
    }
  }

  const onClickCopy = () => {
    const res = decode();
    if (res) {
      setSucess(true);
      setTimeout(() => {
        setSucess(false);
      }, 3000);
      navigator.clipboard.writeText(res);
      setDecodedCode(res);
    }
  }

  const onClickDownload = () => {
    const res = decode();
    if (!res) return;
    const blob = new Blob([res], { type: 'application/octet-stream' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = 'decoded-base-64-payload.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <h3 className="text-center text-xl">
        Decode Base64
      </h3>
      <CodeMirror height="64px" extensions={[EditorView.lineWrapping]} theme={vscodeDark} value={baseValue} onChange={(i) => { setBaseValue(i) }} />
      {err && (
        <p className="text-red-400">
          Could not decode payload
        </p>
      )}
      {success && (
        <p className="text-green-400">
          Decoded payload copied to clipboard
        </p>
      )}
      <div className="flex justify-start gap-4">
        <button className="cursor-pointer bg-green-900 px-4 py-2 rounded-2xl shadow-lg" onClick={onClickCopy}>
          Decoded payload
        </button>
        <button className="cursor-pointer bg-orange-800 px-4 py-2 rounded-2xl shadow-lg" onClick={onClickDownload}>
          Download decoded payload
        </button>
      </div>
    </div>
  )
}
