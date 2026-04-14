import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

import { useRef, useState } from "react";

import * as sparkplugB from '@jcoreio/sparkplug-payload/spBv1.0';

const defaultValue = 'CO/J9rHUMxIZCgp0ZXN0LXZhbHVlIAo4AGkAAAAAAABZQA==';

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);

  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

export default function DecoderFile({ setDecodedCode }) {
  const [binary, setBinary] = useState(defaultValue);
  const [err, setErr] = useState(false);
  const [success, setSucess] = useState(false);

  const decode = () => {
    try {
      const decoded = sparkplugB.decodePayload(binary);
      setErr(false);
      const final = JSON.stringify(decoded, (_, value) =>
        typeof value === 'bigint' ? Number(value) : value
      );;

      return JSON.stringify(JSON.parse(final), null, 2);

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
    a.download = 'decoded-binary-payload.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }

  const inputElement = useRef(null);

  const handleOnChange = () => {
    const { current } = inputElement;
    const [file] = current.files;
    console.log(file, 'aa')
    const reader = new FileReader();
    reader.onload = function (event) {
      const arrayBuffer = event.target.result; // This is the binary data as an ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer); // Use a Typed Array to work with bytes
      setBinary(uint8Array);
    };
    reader.readAsArrayBuffer(file);
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <h3 className="text-center text-xl">
        Decode File
      </h3>
      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 bg-neutral-secondary-medium border border-dashed border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium">
          <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
            <svg className="w-8 h-8 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2" /></svg>
            <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          </div>
          <input ref={inputElement} id="dropzone-file" onChange={handleOnChange} type="file" className="hidden" />
        </label>
      </div>
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
          Decode payload
        </button>
        <button className="cursor-pointer bg-orange-800 px-4 py-2 rounded-2xl shadow-lg" onClick={onClickDownload}>
          Download decoded payload
        </button>
      </div>
    </div>
  )
}
