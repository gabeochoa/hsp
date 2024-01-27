export function Header({ text }) {
  return <h1 className="mb-4 text-4xl text-black dark:text-white">{text}</h1>;
}

export function TextXL({ content }) {
  return (
    <div className="mb-2 text-xl font-bold dark:text-white">{content}</div>
  );
}

export function BasicText({ content }) {
  return <p className={'dark:text-white'}>{content}</p>;
}
