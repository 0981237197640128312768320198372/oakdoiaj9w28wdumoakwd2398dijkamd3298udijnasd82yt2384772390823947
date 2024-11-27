export default function ErrorPage() {
  return (
    <html>
      <head>
        <title>This site can’t be reached</title>
      </head>
      <body
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#121212",
          color: "#bbb",
          textAlign: "center",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>This site can’t be reached</h1>
        <p>ERR_CONNECTION_FAILED</p>
      </body>
    </html>
  )
}
