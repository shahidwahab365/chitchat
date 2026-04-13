import Logo from "./logo";

function MainHeader() {
  return (
    <header className="w-full h-14 flex items-center justify-start px-3 py-2 dark:bg-sidebar">
      <Logo className="w-20" />
    </header>
  );
}

export default MainHeader;
