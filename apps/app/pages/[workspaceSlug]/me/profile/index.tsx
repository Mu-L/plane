import React, { useEffect, useState } from "react";

// react-hook-form
import { Controller, useForm } from "react-hook-form";
// services
import fileService from "services/file.service";
import userService from "services/user.service";
// hooks
import useUserAuth from "hooks/use-user-auth";
import useToast from "hooks/use-toast";
// layouts
import { WorkspaceAuthorizationLayout } from "layouts/auth-layout";
import SettingsNavbar from "layouts/settings-navbar";
// components
import { ImagePickerPopover, ImageUploadModal } from "components/core";
// ui
import { CustomSelect, DangerButton, Input, SecondaryButton, Spinner } from "components/ui";
import { BreadcrumbItem, Breadcrumbs } from "components/breadcrumbs";
// icons
import { UserIcon } from "@heroicons/react/24/outline";
// types
import type { NextPage } from "next";
import type { IUser } from "types";
// constants
import { USER_ROLES } from "constants/workspace";

const defaultValues: Partial<IUser> = {
  avatar: "",
  cover_image: "",
  first_name: "",
  last_name: "",
  email: "",
  role: "Product / Project Manager",
};

const Profile: NextPage = () => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IUser>({ defaultValues });

  const { setToastAlert } = useToast();
  const { user: myProfile, mutateUser } = useUserAuth();

  useEffect(() => {
    reset({ ...defaultValues, ...myProfile });
  }, [myProfile, reset]);

  const onSubmit = async (formData: IUser) => {
    if (formData.first_name === "" || formData.last_name === "") {
      setToastAlert({
        type: "error",
        title: "Error!",
        message: "First and last names are required.",
      });

      return;
    }

    const payload: Partial<IUser> = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      avatar: formData.avatar,
      cover_image: formData.cover_image,
      role: formData.role,
      display_name: formData.display_name,
    };

    await userService
      .updateUser(payload)
      .then((res) => {
        mutateUser((prevData: any) => {
          if (!prevData) return prevData;

          return { ...prevData, ...res };
        }, false);
        setToastAlert({
          type: "success",
          title: "Success!",
          message: "Profile updated successfully.",
        });
      })
      .catch(() =>
        setToastAlert({
          type: "error",
          title: "Error!",
          message: "There was some error in updating your profile. Please try again.",
        })
      );
  };

  const handleDelete = (url: string | null | undefined, updateUser: boolean = false) => {
    if (!url) return;

    setIsRemoving(true);

    fileService.deleteUserFile(url).then(() => {
      if (updateUser)
        userService
          .updateUser({ avatar: "" })
          .then(() => {
            setToastAlert({
              type: "success",
              title: "Success!",
              message: "Profile picture removed successfully.",
            });
            mutateUser((prevData: any) => {
              if (!prevData) return prevData;
              return { ...prevData, avatar: "" };
            }, false);
          })
          .catch(() => {
            setToastAlert({
              type: "error",
              title: "Error!",
              message: "There was some error in deleting your profile picture. Please try again.",
            });
          })
          .finally(() => setIsRemoving(false));
    });
  };

  return (
    <WorkspaceAuthorizationLayout
      breadcrumbs={
        <Breadcrumbs>
          <BreadcrumbItem title="My Profile" />
        </Breadcrumbs>
      }
    >
      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={() => setIsImageUploadModalOpen(false)}
        onSuccess={(url) => {
          setValue("avatar", url);
          handleSubmit(onSubmit)();
          setIsImageUploadModalOpen(false);
        }}
        value={watch("avatar") !== "" ? watch("avatar") : undefined}
        userImage
      />
      {myProfile ? (
        <div className="p-8">
          <div className="mb-8 space-y-6">
            <div>
              <h3 className="text-3xl font-semibold">Profile Settings</h3>
              <p className="mt-1 text-custom-text-200">
                This information will be visible to only you.
              </p>
            </div>
            <SettingsNavbar profilePage />
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 sm:space-y-12">
            <div className="grid grid-cols-12 gap-4 sm:gap-16">
              <div className="col-span-12 sm:col-span-6">
                <h4 className="text-lg font-semibold text-custom-text-100">Profile Picture</h4>
                <p className="text-sm text-custom-text-200">
                  Max file size is 5MB. Supported file types are .jpg and .png.
                </p>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setIsImageUploadModalOpen(true)}>
                    {!watch("avatar") || watch("avatar") === "" ? (
                      <div className="h-12 w-12 rounded-md bg-custom-background-80 p-2">
                        <UserIcon className="h-full w-full text-custom-text-200" />
                      </div>
                    ) : (
                      <div className="relative h-12 w-12 overflow-hidden">
                        <img
                          src={watch("avatar")}
                          className="absolute top-0 left-0 h-full w-full object-cover rounded-md"
                          onClick={() => setIsImageUploadModalOpen(true)}
                          alt={myProfile.display_name}
                        />
                      </div>
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    <SecondaryButton
                      onClick={() => {
                        setIsImageUploadModalOpen(true);
                      }}
                    >
                      Upload
                    </SecondaryButton>
                    {myProfile.avatar && myProfile.avatar !== "" && (
                      <DangerButton
                        onClick={() => handleDelete(myProfile.avatar, true)}
                        loading={isRemoving}
                      >
                        {isRemoving ? "Removing..." : "Remove"}
                      </DangerButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 sm:gap-16">
              <div className="col-span-12 sm:col-span-6">
                <h4 className="text-lg font-semibold">Cover Photo</h4>
                <p className="text-sm text-custom-text-200">
                  Select your cover photo from the given library.
                </p>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <div className="h-32 w-full rounded border border-custom-border-200 p-1">
                  <div className="relative h-full w-full rounded">
                    <img
                      src={
                        watch("cover_image") ??
                        "https://images.unsplash.com/photo-1506383796573-caf02b4a79ab"
                      }
                      className="absolute top-0 left-0 h-full w-full object-cover rounded"
                      alt={myProfile?.name ?? "Cover image"}
                    />
                    <div className="absolute bottom-0 flex w-full justify-end">
                      <ImagePickerPopover
                        label={"Change cover"}
                        onChange={(imageUrl) => {
                          setValue("cover_image", imageUrl);
                        }}
                        value={
                          watch("cover_image") ??
                          "https://images.unsplash.com/photo-1506383796573-caf02b4a79ab"
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 sm:gap-16">
              <div className="col-span-12 sm:col-span-6">
                <h4 className="text-lg font-semibold text-custom-text-100">Full Name</h4>
              </div>
              <div className="col-span-12 flex items-center gap-2 sm:col-span-6">
                <Input
                  name="first_name"
                  id="first_name"
                  register={register}
                  error={errors.first_name}
                  placeholder="Enter your first name"
                  autoComplete="off"
                />
                <Input
                  name="last_name"
                  register={register}
                  error={errors.last_name}
                  id="last_name"
                  placeholder="Enter your last name"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 sm:gap-16">
              <div className="col-span-12 sm:col-span-6">
                <h4 className="text-lg font-semibold text-custom-text-100">Display Name</h4>
                <p className="text-sm text-custom-text-200">
                  This could be your first name, or a nickname — however you{"'"}d like people to
                  refer to you in Plane.
                </p>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <Input
                  id="display_name"
                  name="display_name"
                  autoComplete="off"
                  register={register}
                  error={errors.display_name}
                  className="w-full"
                  placeholder="Enter your display name"
                  validations={{
                    required: "Display name is required.",
                    validate: (value) => {
                      if (value.trim().length < 1) return "Display name can't be empty.";

                      if (value.split("  ").length > 1)
                        return "Display name can't have two consecutive spaces.";

                      if (value.replace(/\s/g, "").length < 1)
                        return "Display name must be at least 1 characters long.";

                      if (value.replace(/\s/g, "").length > 20)
                        return "Display name must be less than 20 characters long.";

                      return true;
                    },
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 sm:gap-16">
              <div className="col-span-12 sm:col-span-6">
                <h4 className="text-lg font-semibold text-custom-text-100">Email</h4>
                <p className="text-sm text-custom-text-200">
                  The email address that you are using.
                </p>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <Input
                  id="email"
                  name="email"
                  autoComplete="off"
                  register={register}
                  error={errors.name}
                  className="w-full"
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 sm:gap-16">
              <div className="col-span-12 sm:col-span-6">
                <h4 className="text-lg font-semibold text-custom-text-100">Role</h4>
                <p className="text-sm text-custom-text-200">Add your role.</p>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({ field: { value, onChange } }) => (
                    <CustomSelect
                      value={value}
                      onChange={onChange}
                      label={value ? value.toString() : "Select your role"}
                      buttonClassName={errors.role ? "border-red-500 bg-red-500/10" : ""}
                      width="w-full"
                      input
                      position="right"
                    >
                      {USER_ROLES.map((item) => (
                        <CustomSelect.Option key={item.value} value={item.value}>
                          {item.label}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  )}
                />
                {errors.role && <span className="text-xs text-red-500">Please select a role</span>}
              </div>
            </div>
            <div className="sm:text-right">
              <SecondaryButton type="submit" loading={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update profile"}
              </SecondaryButton>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid h-full w-full place-items-center px-4 sm:px-0">
          <Spinner />
        </div>
      )}
    </WorkspaceAuthorizationLayout>
  );
};

export default Profile;
