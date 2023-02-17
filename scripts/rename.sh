for file in **/zh_Hans.json
do
  mv "$file" "${file/zh_Hans.json/zh.json}"
done
