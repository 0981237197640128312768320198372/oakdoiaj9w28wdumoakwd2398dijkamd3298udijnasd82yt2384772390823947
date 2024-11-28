/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server"
import Imap from "node-imap"
import { simpleParser } from "mailparser"
import { Buffer } from "buffer"

const imapConfig = {
  user: process.env.IMAP_USER as string,
  password: process.env.IMAP_PASSWORD as string,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
}

const folderMap = {
  inbox: "INBOX",
  spam: "[Gmail]/Spam",
  all: "[Gmail]/All Mail",
}

const decodeMimeEncodedText = (encodedText: string): string => {
  if (!encodedText.match(/=\?([^?]+)\?[BQ]\?([^?]+)\?=/)) {
    return encodedText
  }
  const regex = /=\?([^?]+)\?([BQ])\?([^?]*)\?=/gi
  return encodedText.replace(regex, (_, charset, encoding, encodedData) => {
    if (encoding.toUpperCase() === "B") {
      return Buffer.from(encodedData, "base64").toString(charset)
    } else if (encoding.toUpperCase() === "Q") {
      return encodedData
        .replace(/_/g, " ")
        .replace(/=([A-Fa-f0-9]{2})/g, (_: any, hex: string) =>
          String.fromCharCode(parseInt(hex, 16))
        )
    }
    return encodedText
  })
}

const fetchEmailsFromFolder = (folder: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig)

    imap.once("ready", () => {
      imap.openBox(folder, true, (err, box) => {
        if (err) {
          console.error(`Failed to open folder: ${folder}`, err)
          return reject(new Error("Could not open the specified folder."))
        }

        const totalMessages = box.messages?.total || 0
        if (totalMessages === 0) {
          resolve([])
          return
        }

        const fetchRange = `${Math.max(totalMessages - 49, 1)}:${totalMessages}`
        const f = imap.seq.fetch(fetchRange, {
          bodies: "",
          struct: true,
        })

        const fetchedEmails: any[] = []
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
                const encodedSubject = decodeMimeEncodedText(subject)

                try {
                  const parsedEmail = await simpleParser(buffer)
                  const htmlBody = parsedEmail.html || parsedEmail.text || ""

                  if (
                    htmlBody.includes("Netflix") ||
                    htmlBody.includes("Microsoft") ||
                    htmlBody.includes("Amazon") ||
                    htmlBody.includes("Prime Video")
                  ) {
                    fetchedEmails.push({
                      uid,
                      from,
                      to,
                      subject: encodedSubject,
                      date: parsedEmail.date || "Unknown",
                      body: htmlBody,
                    })
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
              resolve(fetchedEmails)
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

export async function GET(request: NextRequest) {
  try {
    const folderParam = request.nextUrl.searchParams.get("folder") || "inbox"
    const folder =
      folderMap[folderParam as keyof typeof folderMap] || folderMap.inbox

    const emailData = await fetchEmailsFromFolder(folder)
    console.log(`Returning ${emailData.length}`)
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
