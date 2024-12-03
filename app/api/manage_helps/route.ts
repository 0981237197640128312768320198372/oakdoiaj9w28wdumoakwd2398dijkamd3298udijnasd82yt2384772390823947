/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
})

const bucketName = process.env.GCP_BUCKET_NAME || ""
const fileName = "helps.json"

export async function POST(request: Request) {
  try {
    const {
      action,
      help,
      id,
      updatedHelp,
      helpId,
      stepIndex,
      newStep,
      updatedStep,
    } = await request.json()

    // Get the file from the Google Cloud bucket
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fileName)

    const [exists] = await file.exists()
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Download the file and parse the JSON data
    const [contents] = await file.download()
    const helps = JSON.parse(contents.toString())

    let updatedHelps = [...helps]

    // Handle actions
    if (action === "add") {
      if (!help) {
        return NextResponse.json(
          { error: "Missing help data for add action" },
          { status: 400 }
        )
      }
      updatedHelps.push(help)
    } else if (action === "update") {
      if (!id || !updatedHelp) {
        return NextResponse.json(
          { error: "Missing id or updatedHelp data for update action" },
          { status: 400 }
        )
      }
      updatedHelps = updatedHelps.map((item: any) =>
        item.id === id ? { ...item, ...updatedHelp } : item
      )
    } else if (action === "delete") {
      if (!id) {
        return NextResponse.json(
          { error: "Missing id for delete action" },
          { status: 400 }
        )
      }
      updatedHelps = updatedHelps.filter((item: any) => item.id !== id)
    } else if (action === "addStep") {
      // Add a step to a specific help item
      if (!helpId || !newStep) {
        return NextResponse.json(
          { error: "Missing helpId or newStep data for addStep action" },
          { status: 400 }
        )
      }
      updatedHelps = updatedHelps.map((item: any) =>
        item.id === helpId ? { ...item, steps: [...item.steps, newStep] } : item
      )
    } else if (action === "updateStep") {
      // Update a specific step in a help item
      if (helpId === undefined || stepIndex === undefined || !updatedStep) {
        return NextResponse.json(
          {
            error:
              "Missing helpId, stepIndex, or updatedStep data for updateStep action",
          },
          { status: 400 }
        )
      }
      updatedHelps = updatedHelps.map((item: any) =>
        item.id === helpId
          ? {
              ...item,
              steps: item.steps.map((step: any, index: number) =>
                index === stepIndex ? { ...step, ...updatedStep } : step
              ),
            }
          : item
      )
    } else if (action === "deleteStep") {
      // Delete a specific step from a help item
      if (helpId === undefined || stepIndex === undefined) {
        return NextResponse.json(
          { error: "Missing helpId or stepIndex data for deleteStep action" },
          { status: 400 }
        )
      }
      updatedHelps = updatedHelps.map((item: any) =>
        item.id === helpId
          ? {
              ...item,
              steps: item.steps.filter(
                (_: any, index: number) => index !== stepIndex
              ),
            }
          : item
      )
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Upload the updated JSON data back to the bucket
    await file.save(JSON.stringify(updatedHelps, null, 2), {
      contentType: "application/json",
    })

    return NextResponse.json({
      message: "Operation successful",
      helps: updatedHelps,
    })
  } catch (error) {
    console.error("Error handling helps:", error)
    return NextResponse.json(
      { error: "Failed to handle helps operation" },
      { status: 500 }
    )
  }
}
