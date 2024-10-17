import { NextAuthOptions } from "next-auth";
import dbConnect from "@repo/db/mongooseConnect";
import { userModel } from "@repo/db/models/user";
import bcrypt from "bcrypt";

import CredentialsProvider from "next-auth/providers/credentials";
export const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        name: {
          label: "Name",
          type: "text",
          placeholder: "John Doe",
        },
        email: {
          label: "Email",
          type: "text",
          placeholder: "johnDoe@gmail.com",
        },
        image: {
          label: "Image",
          type: "text",
          placeholder: "https://image.png",
        },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },

      async authorize(credentials: any): Promise<any> {
        console.log("cred: ", credentials);
        await dbConnect();

        try {
          const user = await userModel.findOne({
            email: credentials.email,
          });
          console.log("user", user);

          if (user) {
            const isValid = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (!isValid) throw new Error("Password is incorrect");
          } else {
            //create new user
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const newUser = new userModel({
              email: credentials.email,
              password: hashedPassword,
              name: credentials.name,
              role: credentials.role,
              image: credentials.image,
            });
            await newUser.save();
            console.log("new user", newUser);
            return newUser;
          }
          return user;
        } catch (err: any) {
          console.log(err.message);
          throw new Error(err);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token._id = user._id?.toString() as string;
        token.name = user.name;
        token.role = user.role;
        token.email = user.email;
        token.image = user.image;
      }
      console.log("user jwt", user, "token:", token, "session:", session);

      if (trigger === "update") {
        console.log("triggered", session);
        if (session?.role !== undefined) {
          console.log("session defined");
          token.role = session.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id;
      session.user.name = token.name;
      session.user.role = token.role;
      session.user.email = token.email;
      session.user.image = token.image;
      console.log("session.user", session.user);
      return session;
    },
  },
  //   pages: {
  //     signIn: "/sign-in",
  //   },
  session: {
    strategy: "jwt",
  },
  theme: {
    colorScheme: "light", // "auto" | "dark" | "light"
    brandColor: "", // Hex color code
    logo: "https://static.vecteezy.com/system/resources/thumbnails/005/545/335/small/user-sign-icon-person-symbol-human-avatar-isolated-on-white-backogrund-vector.jpg", // Absolute URL to image
    buttonText: "", // Hex color code
  },

  secret: process.env.NEXTAUTH_SECRET,
};
