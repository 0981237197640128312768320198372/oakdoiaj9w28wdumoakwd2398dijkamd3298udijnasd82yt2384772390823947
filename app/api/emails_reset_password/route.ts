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

const fetchLatestEmails = (searchEmail: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig)

    imap.once("ready", () => {
      imap.openBox("INBOX", true, (err, box) => {
        if (err) return reject(err)

        const fetchRange = `${Math.max(box.messages.total - 149, 1)}:${
          box.messages.total
        }`
        const f = imap.seq.fetch(fetchRange, {
          bodies: "",
          struct: true,
        })

        const matchedEmails: any[] = []

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

            const formatDatethailand = (dateString: string) => {
              const date = new Date(dateString)
              const options: Intl.DateTimeFormatOptions = {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }
              return new Intl.DateTimeFormat("th-TH", options).format(date)
            }

            stream.once("end", async () => {
              const from = extractHeader(buffer, "From") || "Unknown"
              const to = extractHeader(buffer, "To") || "Unknown"
              const subject = extractHeader(buffer, "Subject") || "No Subject"
              const rawDate = extractHeader(buffer, "Date") || "Unknown"

              const formattedDate = formatDatethailand(rawDate)

              try {
                const parsedEmail = await simpleParser(buffer)
                const htmlBody = parsedEmail.html || parsedEmail.text || ""

                if (
                  (to.includes(searchEmail) || from.includes(searchEmail)) &&
                  // htmlBody.includes("Complete your password reset request") ||
                  // htmlBody.includes(
                  //   "ทำการขอรีเซ็ตรหัสผ่านของคุณให้เสร็จสมบูรณ์"
                  // ) ||
                  (htmlBody.includes("รีเซ็ตรหัสผ่านของคุณ") ||
                    htmlBody.includes("Reset your password"))
                ) {
                  matchedEmails.push({
                    uid,
                    from,
                    to,
                    subject,
                    date: formattedDate,
                    body: htmlBody,
                  })
                }
                console.log(`Searching ${searchEmail}`)
                console.log("")
                console.log("")
                console.log(`Fetched : ${subject}`)
                console.log(`To : ${to}`)
                console.log(`From : ${from}`)
              } catch (err) {
                console.error(`Error parsing email with UID ${uid}:`, err)
              }
            })
          })
        })

        f.once("end", () => {
          imap.end()
          resolve(matchedEmails) // Resolve with matched emails
        })
      })
    })

    imap.once("error", (err) => reject(err))
    imap.connect()
  })
}

// Function to extract email headers
const extractHeader = (emailData: string, headerName: string) => {
  const regex = new RegExp(`^${headerName}: (.+)$`, "mi")
  const match = emailData.match(regex)
  return match ? match[1].trim() : null
}

// API route handler
export async function GET(request: Request) {
  const { search } = Object.fromEntries(new URL(request.url).searchParams)

  try {
    // Fetch emails with the search query
    const matchedEmails = await fetchLatestEmails(search || "")
    return NextResponse.json(matchedEmails) // Return matched emails directly
  } catch (error) {
    console.error("Error fetching emails:", error)
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    )
  }
}
