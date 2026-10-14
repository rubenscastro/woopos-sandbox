// Lottie animation JSON assets. Declared as a lightweight module (rather than enabling
// resolveJsonModule) so TypeScript doesn't infer a huge literal type for the ~95KB file — the
// value is only ever handed to lottie-react's `animationData`, which is typed `unknown`.
declare module '*.lottie.json' {
  const value: unknown;
  export default value;
}
