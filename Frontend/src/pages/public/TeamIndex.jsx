
import React from "react";
import TeamFinder from "../../components/team/TeamFinder";

export default function TeamIndex(){
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-xl sm:text-xl font-semibold justify-center flex">
        Encuentre al abogado o especialista que busca
      </h1>
      <TeamFinder className="mt-2" />
    </div>
  );
}
