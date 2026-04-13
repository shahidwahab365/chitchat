import Logo from "./logo";

function SplashScreen() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-accent gap-4 ">
      <Logo className="w-80" />

      <div className="w-70 h-2 bg-primary-foreground overflow-hidden rounded-full relative">
        <div className="absolute top-0 left-[-40%] h-full w-2/3 bg-primary animate-loading-bar"></div>
      </div>
    </div>
  );
}

export default SplashScreen;
