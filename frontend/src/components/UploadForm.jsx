import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import config from "../config";
import store from "../store";
import {getAuth} from "firebase/auth";

const Modal = ({ modalOpen = false, setModalOpen }) => {
  const [uploadType, setUploadType] = useState("Book");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      handleOpen();
    } else {
      handleClose();
    }
  }, [modalOpen]);

  const handleClose = () => {
    const modal = document.getElementById("modal-upload-form");
    const backFilm = document.getElementById("back-film");
    if (modal) {
      modal.classList.add("hidden");
      backFilm.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      setModalOpen(false);
    }
  };

  const handleOpen = () => {
    const modal = document.getElementById("modal-upload-form");
    const backFilm = document.getElementById("back-film");
    if (modal) {
      modal.classList.remove("hidden");
      backFilm.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    store.addMessage({ type: "Warning", content: "Upload Started" });
    setLoading(true);
    try {
      const form = e.target;
      const formData = new FormData();
      formData.append("title", form.title.value);
      let endpoint = config.apiUrl+"files/";
      if (uploadType === "Book") {
        formData.append("book", form.file.files[0]);
        endpoint += "upload-book";
        formData.append("author", form.author.value);
        formData.append("publisher", form.publisher.value);
      } else if (uploadType === "Question Paper") {
        endpoint += "upload-question-paper";
        formData.append("questionPaper", form.file.files[0]);
        formData.append("subject", form.subject.value);
        formData.append("institute", form.institute.value);
        formData.append("yearOfExam", form.year.value);
      } else if (uploadType === "Study Material") {
        endpoint += "upload-study-material";
        formData.append("studyMaterial", form.file.files[0]);
        formData.append("subject", form.subject.value);
        formData.append("institute", form.institute.value);
        formData.append("description", form.about.value);
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        store.addMessage({
          type: "Danger",
          content: "User not logged in, please login",
        });
        window.location.href = "/login";
        return;
      }
      const accessToken = await user.getIdToken();
      if (!accessToken) {
        store.addMessage({
          type: "Danger",
          content: "Access token not found, please login",
        });
        window.location.href = "/login";
        return;
      }

      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();
      setLoading(false);
      if (!response.ok) {
        throw new Error(data.message || "Network response was not ok");
      }
      store.addMessage({ type: "Success", content: data.message });
      handleClose();
    } catch (error) {
      setLoading(false);
      store.addMessage({ type: "Danger", content: error.message });
    }
  };

  return (
    <>
      {loading && <Loading />}
      <div
        id="back-film"
        className="w-screen h-screen fixed bg-opacity-55 bg-gray-500 hidden z-30"
      >
        <div
          id="modal-upload-form"
          className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-30 justify-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex items-center"
          tabIndex="-1"
          aria-hidden="true"
        >
          <div className="relative p-4 w-full max-w-xl max-h-full m-auto">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">Upload</h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-4 md:p-5">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="file"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            File
                          </label>
                          <div className="mt-2">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                              <input
                                type="file"
                                name="file"
                                id="file"
                                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                placeholder="File"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="type"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Upload Type
                          </label>
                          <div className="mt-2">
                            <select
                              id="type"
                              name="type"
                              autoComplete="upload-type"
                              required
                              onChange={(e) => setUploadType(e.target.value)}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                            >
                              <option value="Book">Book</option>
                              <option value="Question Paper">
                                Question Paper
                              </option>
                              <option value="Study Material">
                                Study Material
                              </option>
                            </select>
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="title"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Title
                          </label>
                          <div className="mt-2">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                              <input
                                type="text"
                                name="title"
                                id="title"
                                autoComplete="Title"
                                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                placeholder="Title"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {uploadType === "Book" && (
                          <>
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="author"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Author
                              </label>
                              <div className="mt-2">
                                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                  <input
                                    type="text"
                                    name="author"
                                    id="author"
                                    autoComplete="Author"
                                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                    placeholder="Author"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="publisher"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Publisher
                              </label>
                              <div className="mt-2">
                                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                  <input
                                    type="text"
                                    name="publisher"
                                    id="publisher"
                                    autoComplete="Publisher"
                                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                    placeholder="Publisher"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {uploadType === "Question Paper" && (
                          <>
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="subject"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Subject
                              </label>
                              <div className="mt-2">
                                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                  <input
                                    type="text"
                                    name="subject"
                                    id="subject"
                                    autoComplete="Subject"
                                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                    placeholder="Subject"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="institute"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Institute
                              </label>
                              <div className="mt-2">
                                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                  <input
                                    type="text"
                                    name="institute"
                                    id="institute"
                                    autoComplete="Institute"
                                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                    placeholder="Institute"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="year"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Year
                              </label>
                              <div className="mt-2">
                                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                  <input
                                    type="text"
                                    name="year"
                                    id="year"
                                    autoComplete="Year"
                                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                    placeholder="Year"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {uploadType === "Study Material" && (
                          <>
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="subject"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Subject
                              </label>
                              <div className="mt-2">
                                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                  <input
                                    type="text"
                                    name="subject"
                                    id="subject"
                                    autoComplete="Subject"
                                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                    placeholder="Subject"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="institute"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Institute
                              </label>
                              <div className="mt-2">
                                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                  <input
                                    type="text"
                                    name="institute"
                                    id="institute"
                                    autoComplete="Institute"
                                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                    placeholder="Institute"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="sm:col-span-6">
                              <label
                                htmlFor="about"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                About the Material
                              </label>
                              <div className="mt-2">
                                <textarea
                                  id="about"
                                  name="about"
                                  rows="3"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  placeholder="About the Material"
                                  required
                                ></textarea>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-sm font-semibold leading-6 text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
