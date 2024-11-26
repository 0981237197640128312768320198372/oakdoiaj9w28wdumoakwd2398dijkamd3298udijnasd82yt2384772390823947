/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server"
import Imap from "node-imap"
import { simpleParser } from "mailparser"

const imapConfig = {
  user: process.env.IMAP_USER as string,
  password: process.env.IMAP_PASSWORD as string,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
}

const fetchLatestEmails = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig)

    imap.once("ready", () => {
      imap.openBox("[Gmail]/All Mail", true, (err, box) => {
        if (err) return reject(err)

        const fetchRange = `${Math.max(box.messages.total - 49, 1)}:${
          box.messages.total
        }`
        const f = imap.seq.fetch(fetchRange, {
          bodies: "",
          struct: true,
        })

        const matchedEmails: any[] = []
        const emailParsingPromises: Promise<void>[] = []

        f.on("message", (msg) => {
          let buffer = ""
          let uid: string | null = null

          msg.on("attributes", (attrs) => {
            uid = attrs.uid ? String(attrs.uid) : null
          })

          msg.on("body", (stream) => {
            stream.on("data", (chunk) => {
              buffer += chunk.toString("utf8")
            })

            const emailPromise = new Promise<void>((resolveParse) => {
              stream.once("end", async () => {
                const from = extractHeader(buffer, "From") || "Unknown"
                const to = extractHeader(buffer, "To") || "Unknown"
                const subject = extractHeader(buffer, "Subject") || "No Subject"

                try {
                  const parsedEmail = await simpleParser(buffer)
                  const htmlBody = parsedEmail.html || parsedEmail.text || ""

                  if (
                    htmlBody.includes("Netflix") ||
                    htmlBody.includes("Prime Video")
                  ) {
                    matchedEmails.push({
                      uid,
                      from,
                      to,
                      subject,
                      date: parsedEmail.date || "Unknown",
                      body: htmlBody,
                    })
                    console.log(`Matched email with UID: ${uid}`)
                    console.log(`Subject: \n ${subject}`)
                  }
                } catch (err) {
                  console.error(`Error parsing email with UID ${uid}:`, err)
                } finally {
                  resolveParse()
                }
              })
            })

            emailParsingPromises.push(emailPromise)
          })
        })

        f.once("end", () => {
          console.log("Fetch operation complete.")
          Promise.all(emailParsingPromises)
            .then(() => {
              imap.end()
              resolve(matchedEmails)
            })
            .catch(reject)
        })
      })
    })

    imap.once("error", (err) => {
      console.error("IMAP error:", err)
      reject(err)
    })

    imap.once("end", () => {
      console.log("IMAP connection ended.")
    })

    imap.connect()
  })
}

const extractHeader = (emailData: string, headerName: string) => {
  const regex = new RegExp(`^${headerName}: (.+)$`, "mi")
  const match = emailData.match(regex)
  return match ? match[1].trim() : null
}

export async function GET() {
  try {
    const emailData = await fetchLatestEmails()
    console.log(`Returning ${emailData.length} MATCHED EMAILS!`)
    const response = NextResponse.json(emailData, { status: 200 })
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    return response
  } catch (error) {
    console.error("Error fetching emails:", error)
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    )
  }
}
