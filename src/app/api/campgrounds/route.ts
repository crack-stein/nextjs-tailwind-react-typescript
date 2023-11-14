import { uploadImage } from "@/libs/cloudinary";
import connectMongoDB from "@/libs/mongodb";
import Campground from "@/models/Campground";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export const uploadImages = async (files: File[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of files) {
    const uploaded = await uploadImage(file);
    if (uploaded?.url) {
      urls.push(uploaded.url);
    }
  }
  return urls;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    const files = formData.getAll('images') as File[];
    const uploadedUrls = await uploadImages(files);
    //  writeFileSync(file.name, Buffer.from(await file.arrayBuffer()));
    console.log(uploadedUrls);

    await connectMongoDB();

    const imageUrls = [];
    for (const file of files) {
      const uploaded = await uploadImage(file);
      imageUrls.push(uploaded?.url);
    }

    const res = await Campground.create({
      title: data.title,
      location: data.location,
      price: data.price,
      description: data.description,
      imageUrl: imageUrls,
      // imageUrl: uploaded?.url,
    });

    console.log(res);

    return NextResponse.json(
      { message: "Campground created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  await connectMongoDB();
  const campgrounds = await Campground.find();
  return NextResponse.json({ campgrounds });
}

export async function DELETE(request: any) {
  const id = request.nextUrl.searchParams.get("id");
  await connectMongoDB();
  await Campground.findByIdAndDelete(id);
  return NextResponse.json({ message: "Campground deleted" }, { status: 200 });
}
